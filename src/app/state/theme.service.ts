// FIX: Implemented the ThemeService to manage the application's visual theme (light/dark).
import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // FIX: Changed the local storage key to 'theme' to match the inline script in index.html.
  // This ensures theme persistence across page reloads.
  private readonly THEME_KEY = 'theme';

  // State
  readonly currentTheme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Tambahkan kelas transisi ke body sekali saat service diinisialisasi
    // untuk memastikan pergantian tema yang mulus.
    document.body.classList.add('transition-colors', 'duration-500');

    effect(() => {
      const theme = this.currentTheme();
      localStorage.setItem(this.THEME_KEY, theme);

      // Kelola kelas 'dark' pada elemen <html> untuk Tailwind
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Terapkan kelas latar belakang dan teks langsung ke <body>
      // Ini adalah pendekatan yang lebih kuat daripada membungkus router-outlet
      // Menggunakan palet 'slate' untuk tampilan yang lebih sejuk dan modern.
      if (theme === 'dark') {
        document.body.classList.remove('bg-slate-50', 'text-slate-700');
        document.body.classList.add('bg-slate-900', 'text-slate-200');
      } else {
        document.body.classList.remove('bg-slate-900', 'text-slate-200');
        document.body.classList.add('bg-slate-50', 'text-slate-700');
      }
    });
  }

  toggleTheme(): void {
    this.currentTheme.update(theme => (theme === 'light' ? 'dark' : 'light'));
  }

  private getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem(this.THEME_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}