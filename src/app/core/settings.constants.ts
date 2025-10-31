// src/app/core/settings.constants.ts
// 1. Import tipe baru
import type { 
  ThemeSetting, AccentPalette, EditorFont, UiFont, AutoSaveInterval,
  DashboardViewMode, DashboardSortMode
} from '../state/settings.service';

/**
 * Opsi untuk navigasi tab di dalam modal pengaturan.
 */
export const TAB_OPTIONS = [
  { 
    id: 'tampilan' as const, 
    label: 'Tampilan', 
    iconName: 'outline-settings-sliders-24' 
  },
  { 
    id: 'editor' as const, 
    label: 'Editor', 
    iconName: 'solid-pencil-20' 
  },
  {
    id: 'aksesibilitas' as const,
    label: 'Aksesibilitas',
    iconName: 'outline-universal-access-24'
  },
  {
    id: 'data' as const,
    label: 'Manajemen Data',
    iconName: 'outline-export-data-24'
  }
];

/**
 * Opsi untuk pilihan tema aplikasi.
 */
export const THEME_OPTIONS: { value: ThemeSetting, label: string }[] = [
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
  { value: 'system', label: 'Sesuai Sistem' },
];

/**
 * Opsi untuk pilihan warna aksen.
 */
export const ACCENT_OPTIONS: { value: AccentPalette, label: string, color: string }[] = [
  { value: 'purple', label: 'Ungu (Default)', color: '#a855f7' },
  { value: 'blue', label: 'Biru Tenang', color: '#3b82f6' },
  { value: 'green', label: 'Hijau Hutan', color: '#22c55e' },
  { value: 'orange', label: 'Oranye Hangat', color: '#f97316' },
];

/**
 * Opsi untuk pilihan font editor.
 */
export const FONT_OPTIONS: EditorFont[] = ['Lora', 'Inter', 'Merriweather', 'Source Serif Pro'];

/**
 * Opsi untuk pilihan font UI (Aplikasi)
 */
export const UI_FONT_OPTIONS: { value: UiFont, label: string }[] = [
  { value: 'Inter', label: 'Inter (Default)' },
  { value: 'Lexend', label: 'Lexend (Ramah Disleksia)' },
];

/**
 * Opsi untuk interval auto-save.
 */
export const AUTO_SAVE_OPTIONS: { value: AutoSaveInterval, label: string }[] = [
  { value: 1000, label: 'Cepat (setiap 1 detik)' },
  { value: 3000, label: 'Normal (setiap 3 detik)' },
  { value: 5000, label: 'Lambat (setiap 5 detik)' },
  { value: 0,    label: 'Manual (Hanya simpan saat klik tombol)' },
];

/**
 * 2. TAMBAHKAN OPSI PREFERENSI DASHBOARD
 */
export const DASHBOARD_VIEW_OPTIONS: { value: DashboardViewMode, label: string }[] = [
  { value: 'grid', label: 'Tampilan Grid' },
  { value: 'list', label: 'Tampilan Daftar' },
];

export const DASHBOARD_SORT_OPTIONS: { value: DashboardSortMode, label: string }[] = [
  { value: 'lastModified', label: 'Terakhir Diubah' },
  { value: 'title', label: 'Judul (A-Z)' },
];