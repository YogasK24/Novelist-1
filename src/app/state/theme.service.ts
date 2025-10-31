// src/app/state/theme.service.ts
import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { SettingsService } from './settings.service';

type SystemTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private settingsService = inject(SettingsService);

  // Signal untuk memantau preferensi sistem
  private readonly systemPrefersDark = signal<SystemTheme>(this.getSystemPreference());
  
  // Tema AKTIF yang sesungguhnya, berdasarkan pilihan pengguna ATAU sistem
  readonly activeTheme = computed<SystemTheme>(() => {
    const setting = this.settingsService.theme(); // Baca dari SettingsService
    if (setting === 'system') {
      return this.systemPrefersDark();
    }
    return setting; // 'light' or 'dark'
  });

  constructor() {
    // Tambahkan kelas transisi ke body
    document.body.classList.add('transition-colors', 'duration-500');

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => this.systemPrefersDark.set(e.matches ? 'dark' : 'light');

    // Effect untuk Menerapkan Tema ke DOM dan mengelola event listener
    effect((onCleanup) => {
      const theme = this.activeTheme();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.remove('bg-slate-50', 'text-slate-700');
        document.body.classList.add('font-sans-ui', 'bg-slate-900', 'text-slate-200');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('bg-slate-900', 'text-slate-200');
        document.body.classList.add('font-sans-ui', 'bg-slate-50', 'text-slate-700');
      }

      // Pasang listener di dalam effect untuk cleanup yang benar
      mediaQuery.addEventListener('change', listener);
      
      onCleanup(() => {
        mediaQuery.removeEventListener('change', listener);
      });
    });
  }
  
  private getSystemPreference(): SystemTheme {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }

  /**
   * Memutar pilihan tema: system -> light -> dark -> system
   */
  toggleTheme(): void {
    this.settingsService.theme.update(current => {
      if (current === 'system') return 'light';
      if (current === 'light') return 'dark';
      return 'system';
    });
  }
}