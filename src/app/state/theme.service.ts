// src/app/state/theme.service.ts
import { Injectable, signal, effect } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal to hold the current theme
  readonly currentTheme = signal<Theme>('light');

  constructor() {
    this.initializeTheme();
    // Tambahkan kelas transisi ke body sekali saat service diinisialisasi
    // untuk memastikan pergantian tema yang mulus.
    document.body.classList.add('transition-colors', 'duration-500');

    effect(() => {
      const theme = this.currentTheme();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        // Terapkan kelas latar belakang dan teks langsung ke <body> untuk mode gelap
        document.body.classList.remove('bg-slate-50', 'text-slate-700');
        document.body.classList.add('font-sans-ui', 'bg-slate-900', 'text-slate-200');
      } else {
        document.documentElement.classList.remove('dark');
        // Terapkan kelas latar belakang dan teks langsung ke <body> untuk mode terang
        document.body.classList.remove('bg-slate-900', 'text-slate-200');
        document.body.classList.add('font-sans-ui', 'bg-slate-50', 'text-slate-700');
      }
      // Simpan pilihan tema
      localStorage.setItem('theme', theme);
    });
  }
  
  /**
   * Menginisialisasi tema dari localStorage atau preferensi sistem.
   */
  private initializeTheme(): void {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme ?? (systemPrefersDark ? 'dark' : 'light');
    this.currentTheme.set(initialTheme);
  }

  /**
   * Mengganti tema antara 'light' dan 'dark'.
   */
  toggleTheme(): void {
    this.currentTheme.update(current => (current === 'light' ? 'dark' : 'light'));
  }
}
