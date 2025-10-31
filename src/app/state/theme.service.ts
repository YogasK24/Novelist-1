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
      // 1. Cek mode kontras tinggi DULU
      const highContrast = this.settingsService.highContrastMode();
      
      if (highContrast) {
        // JIKA KONTAS TINGGI AKTIF:
        // Hapus paksa kelas tema apa pun agar CSS di index.html bisa mengambil alih.
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('bg-slate-50', 'text-slate-700', 'bg-slate-900', 'text-slate-200');
        return; // Selesai. Jangan lakukan apa-apa lagi.
      }
      
      // 2. JIKA KONTAS TINGGI NONAKTIF (Perilaku normal):
      const theme = this.activeTheme();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.remove('bg-slate-50', 'text-slate-700');
        document.body.classList.add('bg-slate-900', 'text-slate-200');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('bg-slate-900', 'text-slate-200');
        document.body.classList.add('bg-slate-50', 'text-slate-700');
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
   * Mengganti tema antara terang dan gelap.
   * Jika tema saat ini 'sistem', ia akan beralih ke tema yang berlawanan dari
   * apa yang ditampilkan sistem saat ini.
   */
  toggleTheme(): void {
    const currentActiveTheme = this.activeTheme();
    
    // Beralih ke yang berlawanan
    this.settingsService.theme.set(currentActiveTheme === 'light' ? 'dark' : 'light');
  }
}
