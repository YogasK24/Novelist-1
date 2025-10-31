// src/app/state/settings.service.ts
import { Injectable, signal, effect } from '@angular/core';

export type ThemeSetting = 'light' | 'dark' | 'system';
export type EditorFont = 'Lora' | 'Inter' | 'Merriweather' | 'Source Serif Pro';
export type AccentPalette = 'purple' | 'blue' | 'green' | 'orange';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // --- Helper untuk memuat dari localStorage ---
  private loadSetting<T>(key: string, defaultValue: T): T {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
      console.error(`Gagal memuat pengaturan ${key}:`, e);
      return defaultValue;
    }
  }

  // --- State Modal ---
  readonly isModalOpen = signal(false);

  // --- State Pengaturan Tampilan ---
  readonly theme = signal<ThemeSetting>(this.loadSetting('settings_theme', 'system'));
  readonly accentColor = signal<AccentPalette>(this.loadSetting('settings_accent', 'purple')); 

  // --- State Pengaturan Editor ---
  readonly editorFontFamily = signal<EditorFont>(this.loadSetting('settings_editorFont', 'Lora'));
  readonly editorFontSize = signal<number>(this.loadSetting('settings_editorFontSize', 1.125)); // 1.125rem = 18px
  readonly editorLineHeight = signal<number>(this.loadSetting('settings_editorLineHeight', 1.8));
  readonly typewriterMode = signal<boolean>(this.loadSetting('settings_typewriterMode', false));

  constructor() {
    // --- Efek untuk MENYIMPAN ke localStorage & Menerapkan CSS ---
    effect(() => {
      // 1. Simpan semua pengaturan
      localStorage.setItem('settings_theme', JSON.stringify(this.theme()));
      localStorage.setItem('settings_accent', JSON.stringify(this.accentColor()));
      localStorage.setItem('settings_editorFont', JSON.stringify(this.editorFontFamily()));
      localStorage.setItem('settings_editorFontSize', JSON.stringify(this.editorFontSize()));
      localStorage.setItem('settings_editorLineHeight', JSON.stringify(this.editorLineHeight()));
      localStorage.setItem('settings_typewriterMode', JSON.stringify(this.typewriterMode()));

      // 2. Terapkan CSS Variables untuk Editor
      const root = document.documentElement;
      root.style.setProperty('--editor-font-family', `"${this.editorFontFamily()}", ui-serif, serif`);
      root.style.setProperty('--editor-font-size', `${this.editorFontSize()}rem`);
      root.style.setProperty('--editor-line-height', this.editorLineHeight().toString());
      
      // 3. Terapkan Tema Warna Aksen
      root.classList.remove('theme-purple', 'theme-blue', 'theme-green', 'theme-orange');
      root.classList.add(`theme-${this.accentColor()}`);
    });
  }

  // --- API untuk Modal ---
  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }
}