// src/app/state/settings.service.ts
import { Injectable, signal, effect } from '@angular/core';
import type { SortMode, ViewMode } from './book-state.service'; // <-- 1. Import Tipe

export type ThemeSetting = 'light' | 'dark' | 'system';
export type EditorFont = 'Lora' | 'Inter' | 'Merriweather' | 'Source Serif Pro';
export type AccentPalette = 'purple' | 'blue' | 'green' | 'orange';
export type UiFont = 'Inter' | 'Lexend';
export type AutoSaveInterval = 0 | 1000 | 3000 | 5000; // 0 = Manual
// 2. Ekspor tipe yang kita import agar bisa dipakai di konstanta
export { SortMode as DashboardSortMode, ViewMode as DashboardViewMode };

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // --- 1. DEKLARASIKAN NILAI DEFAULT ---
  private readonly defaults = {
    theme: 'system' as ThemeSetting,
    accentColor: 'purple' as AccentPalette,
    uiFontFamily: 'Inter' as UiFont,
    editorFontFamily: 'Lora' as EditorFont,
    editorFontSize: 1.125,
    editorLineHeight: 1.8,
    typewriterMode: false,
    editorIndentFirstLine: true,
    editorParagraphSpacing: true,
    highContrastMode: false,
    editorAutoSaveInterval: 3000 as AutoSaveInterval,
    editorShowStatusBar: true,
    // 3. TAMBAHKAN DEFAULT BARU
    dashboardViewMode: 'grid' as ViewMode,
    dashboardSortMode: 'lastModified' as SortMode
  };

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
  readonly theme = signal<ThemeSetting>(this.loadSetting('settings_theme', this.defaults.theme));
  readonly accentColor = signal<AccentPalette>(this.loadSetting('settings_accent', this.defaults.accentColor)); 
  readonly uiFontFamily = signal<UiFont>(this.loadSetting('settings_uiFont', this.defaults.uiFontFamily));

  // --- State Pengaturan Editor ---
  readonly editorFontFamily = signal<EditorFont>(this.loadSetting('settings_editorFont', this.defaults.editorFontFamily));
  readonly editorFontSize = signal<number>(this.loadSetting('settings_editorFontSize', this.defaults.editorFontSize));
  readonly editorLineHeight = signal<number>(this.loadSetting('settings_editorLineHeight', this.defaults.editorLineHeight));
  readonly typewriterMode = signal<boolean>(this.loadSetting('settings_typewriterMode', this.defaults.typewriterMode));
  readonly editorIndentFirstLine = signal<boolean>(this.loadSetting('settings_editorIndent', this.defaults.editorIndentFirstLine));
  readonly editorParagraphSpacing = signal<boolean>(this.loadSetting('settings_editorSpacing', this.defaults.editorParagraphSpacing));
  readonly editorAutoSaveInterval = signal<AutoSaveInterval>(this.loadSetting('settings_autoSaveInterval', this.defaults.editorAutoSaveInterval));
  readonly editorShowStatusBar = signal<boolean>(this.loadSetting('settings_showStatusBar', this.defaults.editorShowStatusBar));


  // --- State Pengaturan Aksesibilitas ---
  readonly highContrastMode = signal<boolean>(this.loadSetting('settings_highContrast', this.defaults.highContrastMode));
  
  // --- 4. TAMBAHKAN STATE PREFERENSI APLIKASI ---
  readonly dashboardViewMode = signal<ViewMode>(this.loadSetting('settings_dashboardView', this.defaults.dashboardViewMode));
  readonly dashboardSortMode = signal<SortMode>(this.loadSetting('settings_dashboardSort', this.defaults.dashboardSortMode));

  constructor() {
    // --- Efek untuk MENYIMPAN ke localStorage & Menerapkan CSS ---
    effect(() => {
      // 1. Simpan semua pengaturan
      localStorage.setItem('settings_theme', JSON.stringify(this.theme()));
      localStorage.setItem('settings_accent', JSON.stringify(this.accentColor()));
      localStorage.setItem('settings_uiFont', JSON.stringify(this.uiFontFamily()));
      localStorage.setItem('settings_editorFont', JSON.stringify(this.editorFontFamily()));
      localStorage.setItem('settings_editorFontSize', JSON.stringify(this.editorFontSize()));
      localStorage.setItem('settings_editorLineHeight', JSON.stringify(this.editorLineHeight()));
      localStorage.setItem('settings_typewriterMode', JSON.stringify(this.typewriterMode()));
      localStorage.setItem('settings_editorIndent', JSON.stringify(this.editorIndentFirstLine()));
      localStorage.setItem('settings_editorSpacing', JSON.stringify(this.editorParagraphSpacing()));
      localStorage.setItem('settings_highContrast', JSON.stringify(this.highContrastMode()));
      localStorage.setItem('settings_autoSaveInterval', JSON.stringify(this.editorAutoSaveInterval()));
      localStorage.setItem('settings_showStatusBar', JSON.stringify(this.editorShowStatusBar()));
      // 5. TAMBAHKAN KE LOCALSTORAGE
      localStorage.setItem('settings_dashboardView', JSON.stringify(this.dashboardViewMode()));
      localStorage.setItem('settings_dashboardSort', JSON.stringify(this.dashboardSortMode()));


      // 2. Terapkan CSS
      const root = document.documentElement;
      
      // Terapkan CSS Variables untuk Editor
      root.style.setProperty('--editor-font-family', `"${this.editorFontFamily()}", ui-serif, serif`);
      root.style.setProperty('--editor-font-size', `${this.editorFontSize()}rem`);
      root.style.setProperty('--editor-line-height', this.editorLineHeight().toString());
      
      // Terapkan Tema Warna Aksen
      root.classList.remove('theme-purple', 'theme-blue', 'theme-green', 'theme-orange');
      root.classList.add(`theme-${this.accentColor()}`);
      
      // Terapkan Kelas Toggle untuk Opsi Editor
      root.classList.toggle('editor-indent', this.editorIndentFirstLine());
      root.classList.toggle('editor-spacing', this.editorParagraphSpacing());

      // Terapkan Kelas Toggle untuk Aksesibilitas
      root.classList.toggle('high-contrast', this.highContrastMode());

      // Terapkan Font UI
      if (this.uiFontFamily() === 'Lexend') {
        document.body.classList.remove('font-sans-ui');
        document.body.classList.add('font-sans-dyslexic');
      } else {
        document.body.classList.remove('font-sans-dyslexic');
        document.body.classList.add('font-sans-ui');
      }
    });
  }

  // --- API untuk Modal ---
  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  // --- 2. TAMBAHKAN FUNGSI RESET BARU ---
  resetToDefaults(): void {
    this.theme.set(this.defaults.theme);
    this.accentColor.set(this.defaults.accentColor);
    this.uiFontFamily.set(this.defaults.uiFontFamily);
    this.editorFontFamily.set(this.defaults.editorFontFamily);
    this.editorFontSize.set(this.defaults.editorFontSize);
    this.editorLineHeight.set(this.defaults.editorLineHeight);
    this.typewriterMode.set(this.defaults.typewriterMode);
    this.editorIndentFirstLine.set(this.defaults.editorIndentFirstLine);
    this.editorParagraphSpacing.set(this.defaults.editorParagraphSpacing);
    this.highContrastMode.set(this.defaults.highContrastMode);
    this.editorAutoSaveInterval.set(this.defaults.editorAutoSaveInterval);
    this.editorShowStatusBar.set(this.defaults.editorShowStatusBar);
    // 6. TAMBAHKAN KE RESET
    this.dashboardViewMode.set(this.defaults.dashboardViewMode);
    this.dashboardSortMode.set(this.defaults.dashboardSortMode);
  }
}