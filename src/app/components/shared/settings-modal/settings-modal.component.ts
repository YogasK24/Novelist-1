// src/app/components/shared/settings-modal/settings-modal.component.ts
import { Component, ChangeDetectionStrategy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, type AutoSaveInterval } from '../../../state/settings.service';
import { IconComponent } from '../icon/icon.component';
import { ConfirmationService } from '../../../state/confirmation.service';
import { BackupService } from '../../../state/backup.service';
import { NotificationService } from '../../../state/notification.service'; // <-- 1. IMPORT
import { 
  TAB_OPTIONS, 
  THEME_OPTIONS, 
  ACCENT_OPTIONS, 
  FONT_OPTIONS,
  UI_FONT_OPTIONS,
  AUTO_SAVE_OPTIONS,
  DASHBOARD_VIEW_OPTIONS,
  DASHBOARD_SORT_OPTIONS
} from '../../../core/settings.constants';
import { FocusTrapDirective } from '../../../directives/focus-trap.directive';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, FocusTrapDirective],
  template: `
    @if (settingsService.isModalOpen(); as isOpen) {
      <div 
        class="fixed inset-0 bg-black/70 flex justify-center items-center z-50
               transition-opacity duration-300"
        [class.opacity-100]="isOpen"
        [class.opacity-0]="!isOpen"
        [class.pointer-events-none]="!isOpen"
        (click)="settingsService.closeModal()" 
        aria-modal="true" role="dialog"
      >
        <div 
          appFocusTrap
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl 
                 ring-1 ring-black/5 dark:ring-white/10
                 transform transition-all duration-300 flex flex-col overflow-hidden"
          [class.opacity-100]="isOpen" [class.translate-y-0]="isOpen" [class.scale-100]="isOpen"
          [class.opacity-0]="!isOpen" [class.-translate-y-10]="!isOpen" [class.scale-95]="!isOpen"
          (click)="$event.stopPropagation()" 
        >
          <div class="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-300 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
              Kustomisasi Editor & Tampilan
            </h2>
            <button (click)="settingsService.closeModal()" aria-label="Tutup Pengaturan" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500">
              <app-icon name="outline-x-mark-24" class="w-6 h-6"></app-icon>
            </button>
          </div>

          <div class="flex flex-grow min-h-0">
            
            <nav class="w-56 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 p-4 border-r border-gray-300 dark:border-gray-700">
              <ul class="space-y-2">
                @for (tab of tabs; track tab.id) {
                  <li>
                    <button 
                      (click)="activeTab.set(tab.id)"
                      class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors focus:outline-none"
                      [class.bg-accent-100]="activeTab() === tab.id"
                      [class.dark:bg-accent-900/30]="activeTab() === tab.id"
                      [class.text-accent-700]="activeTab() === tab.id"
                      [class.dark:text-accent-300]="activeTab() === tab.id"
                      [class.font-semibold]="activeTab() === tab.id"
                      [class.text-gray-600]="activeTab() !== tab.id"
                      [class.dark:text-gray-400]="activeTab() !== tab.id"
                      [class.hover:bg-gray-200]="activeTab() !== tab.id"
                      [class.dark:hover:bg-gray-700]="activeTab() !== tab.id"
                      [class.focus-visible:bg-gray-200]="activeTab() !== tab.id"
                      [class.dark:focus-visible:bg-gray-700]="activeTab() !== tab.id"
                    >
                      <app-icon [name]="tab.iconName" class="w-5 h-5"></app-icon>
                      <span>{{ tab.label }}</span>
                    </button>
                  </li>
                }
              </ul>
            </nav>

            <div class="flex-grow p-6 min-w-0 max-h-[70vh] overflow-y-auto">
              @switch (activeTab()) {
                
                @case ('tampilan') {
                  <div class="space-y-6">
                    <fieldset class="space-y-2">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Tema Aplikasi</legend>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Pilih kenyamanan visual Anda.</p>
                      <div class="flex flex-col sm:flex-row gap-4 pt-2">
                        @for (theme of themeOptions; track theme.value) {
                          <label class="flex items-center gap-2 p-3 rounded-md border-2 transition-colors cursor-pointer"
                                 [class.border-accent-600]="settingsService.theme() === theme.value"
                                 [class.bg-accent-50]="settingsService.theme() === theme.value"
                                 [class.dark:bg-accent-900/30]="settingsService.theme() === theme.value"
                                 [class.border-gray-300]="settingsService.theme() !== theme.value"
                                 [class.dark:border-gray-700]="settingsService.theme() !== theme.value">
                            <input type="radio" name="theme" 
                                   [value]="theme.value" 
                                   [ngModel]="settingsService.theme()"
                                   (ngModelChange)="settingsService.theme.set($event)"
                                   class="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-400">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ theme.label }}</span>
                          </label>
                        }
                      </div>
                    </fieldset>

                    <fieldset class="space-y-2 border-t border-gray-300 dark:border-gray-700 pt-6">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Warna Aksen</legend>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Sentuhan personalisasi untuk tombol dan highlight.</p>
                      <div class="flex flex-wrap gap-4 pt-2">
                        @for (opt of accentOptions; track opt.value) {
                          <label class="flex items-center gap-2 p-3 rounded-md border-2 transition-colors cursor-pointer"
                                 [class.border-accent-600]="settingsService.accentColor() === opt.value"
                                 [class.bg-accent-100]="settingsService.accentColor() === opt.value"
                                 [class.dark:bg-accent-900/30]="settingsService.accentColor() === opt.value"
                                 [class.border-gray-300]="settingsService.accentColor() !== opt.value"
                                 [class.dark:border-gray-700]="settingsService.accentColor() !== opt.value">
                            <input type="radio" name="accent" 
                                   [value]="opt.value" 
                                   [ngModel]="settingsService.accentColor()"
                                   (ngModelChange)="settingsService.accentColor.set($event)"
                                   class="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-400">
                            <span [style.background-color]="opt.color" class="w-5 h-5 rounded-full border border-black/10"></span>
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ opt.label }}</span>
                          </label>
                        }
                      </div>
                    </fieldset>
                    
                    <fieldset class="space-y-2 border-t border-gray-300 dark:border-gray-700 pt-6">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Font Antarmuka (UI)</legend>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Ubah font untuk seluruh aplikasi (tombol, menu, dll).</p>
                      
                      <div>
                        <label for="uiFontFamily" class="sr-only">Pilih Font UI</label>
                        <select id="uiFontFamily"
                                [ngModel]="settingsService.uiFontFamily()"
                                (ngModelChange)="settingsService.uiFontFamily.set($event)"
                                class="w-full sm:w-2/3 mt-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                                       text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-600">
                          @for (font of uiFontOptions; track font.value) {
                            <option [value]="font.value">{{ font.label }}</option>
                          }
                        </select>
                      </div>
                    </fieldset>

                    <fieldset class="space-y-4 border-t border-gray-300 dark:border-gray-700 pt-6">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Preferensi Dashboard</legend>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tampilan Default</label>
                        <div class="flex gap-4">
                          @for (opt of dashboardViewOptions; track opt.value) {
                            <label class="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="dashboardView"
                                     [value]="opt.value"
                                     [ngModel]="settingsService.dashboardViewMode()"
                                     (ngModelChange)="settingsService.dashboardViewMode.set($event)"
                                     class="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-400">
                              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ opt.label }}</span>
                            </label>
                          }
                        </div>
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan Default</label>
                         <div class="flex gap-4">
                          @for (opt of dashboardSortOptions; track opt.value) {
                            <label class="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="dashboardSort"
                                     [value]="opt.value"
                                     [ngModel]="settingsService.dashboardSortMode()"
                                     (ngModelChange)="settingsService.dashboardSortMode.set($event)"
                                     class="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-400">
                              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ opt.label }}</span>
                            </label>
                          }
                        </div>
                      </div>

                    </fieldset>
                  </div>
                }

                @case ('editor') {
                  <div class="space-y-6">
                    <fieldset class="space-y-4">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Tipografi</legend>
                      
                      <div>
                        <label for="fontFamily" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Font</label>
                        <select id="fontFamily"
                                [ngModel]="settingsService.editorFontFamily()"
                                (ngModelChange)="settingsService.editorFontFamily.set($event)"
                                class="w-full sm:w-2/3 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                                       text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-600">
                          @for (font of fontOptions; track font) {
                            <option [value]="font">{{ font }}</option>
                          }
                        </select>
                      </div>

                      <div>
                        <label for="fontSize" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ukuran Font ({{ settingsService.editorFontSize() }}rem)
                        </label>
                         <div class="flex items-center gap-3 w-full sm:w-2/3">
                          <span class="text-xs text-gray-500 dark:text-gray-400">Kecil</span>
                          <input type="range" id="fontSize" min="0.875" max="1.5" step="0.125"
                                 [ngModel]="settingsService.editorFontSize()"
                                 (ngModelChange)="onFontSizeChange($event)"
                                 class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent-600">
                          <span class="text-xs text-gray-500 dark:text-gray-400">Besar</span>
                        </div>
                      </div>

                      <div>
                        <label for="lineHeight" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Jarak Baris ({{ settingsService.editorLineHeight() }}x)
                        </label>
                        <div class="flex items-center gap-3 w-full sm:w-2/3">
                          <span class="text-xs text-gray-500 dark:text-gray-400">Rapat</span>
                          <input type="range" id="lineHeight" min="1.4" max="2.2" step="0.1"
                                 [ngModel]="settingsService.editorLineHeight()"
                                 (ngModelChange)="onLineHeightChange($event)"
                                 class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent-600">
                          <span class="text-xs text-gray-500 dark:text-gray-400">Lebar</span>
                        </div>
                      </div>
                    </fieldset>

                    <div class="border-t border-gray-300 dark:border-gray-700 pt-6">
                      <label for="livePreview" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pratinjau Langsung (Interaktif)
                      </label>
                      <textarea 
                        id="livePreview"
                        rows="4"
                        class="w-full p-4 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 
                               text-gray-900 dark:text-gray-300 resize-none
                               focus:outline-none focus:ring-2 focus:ring-accent-500"
                        placeholder="Ketik di sini untuk merasakan font pilihan Anda..."
                        [style.fontFamily]="settingsService.editorFontFamily()"
                        [style.fontSize.rem]="settingsService.editorFontSize()"
                        [style.lineHeight]="settingsService.editorLineHeight()"
                      ></textarea>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        * Pratinjau ini akan menerapkan Jenis Font, Ukuran, dan Jarak Baris.
                        <br/>
                        * Indentasi & Spasi Paragraf akan terlihat di editor yang sesungguhnya.
                      </p>
                    </div>

                    <fieldset class="space-y-4 border-t border-gray-300 dark:border-gray-700 pt-6">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Format Paragraf</legend>
                      
                      <div class="relative flex items-start">
                        <div class="flex items-center h-5">
                          <input id="indentFirstLine" type="checkbox" 
                                 [ngModel]="settingsService.editorIndentFirstLine()"
                                 (ngModelChange)="settingsService.editorIndentFirstLine.set($event)"
                                 class="h-4 w-4 text-accent-600 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500">
                        </div>
                        <div class="ml-3 text-sm">
                          <label for="indentFirstLine" class="font-medium text-gray-700 dark:text-gray-300">Indentasi Baris Pertama</label>
                          <p class="text-gray-600 dark:text-gray-400">Beri jarak inden di awal setiap paragraf.</p>
                        </div>
                      </div>

                      <div class="relative flex items-start">
                        <div class="flex items-center h-5">
                          <input id="paragraphSpacing" type="checkbox" 
                                 [ngModel]="settingsService.editorParagraphSpacing()"
                                 (ngModelChange)="settingsService.editorParagraphSpacing.set($event)"
                                 class="h-4 w-4 text-accent-600 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500">
                        </div>
                        <div class="ml-3 text-sm">
                          <label for="paragraphSpacing" class="font-medium text-gray-700 dark:text-gray-300">Spasi Antar Paragraf</label>
                          <p class="text-gray-600 dark:text-gray-400">Tambah sedikit spasi ekstra di antara paragraf.</p>
                        </div>
                      </div>

                    </fieldset>

                    <fieldset class="space-y-4 border-t border-gray-300 dark:border-gray-700 pt-6">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Perilaku Editor</legend>
                      
                      <div>
                        <label for="autoSave" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interval Auto-Save</label>
                        <select id="autoSave"
                                [ngModel]="settingsService.editorAutoSaveInterval()"
                                (ngModelChange)="onAutoSaveIntervalChange($event)"
                                class="w-full sm:w-2/3 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                                       text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-600">
                          @for (opt of autoSaveOptions; track opt.value) {
                            <option [value]="opt.value">{{ opt.label }}</option>
                          }
                        </select>
                      </div>

                      <div class="relative flex items-start">
                        <div class="flex items-center h-5">
                          <input id="statusBar" type="checkbox" 
                                 [ngModel]="settingsService.editorShowStatusBar()"
                                 (ngModelChange)="settingsService.editorShowStatusBar.set($event)"
                                 class="h-4 w-4 text-accent-600 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500">
                        </div>
                        <div class="ml-3 text-sm">
                          <label for="statusBar" class="font-medium text-gray-700 dark:text-gray-300">Tampilkan Status Bar</label>
                          <p class="text-gray-600 dark:text-gray-400">Tampilkan jumlah kata di bawah editor.</p>
                        </div>
                      </div>
                    </fieldset>

                    <fieldset class="space-y-2 border-t border-gray-300 dark:border-gray-700 pt-6">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Mode Menulis</legend>
                      <div class="relative flex items-start">
                        <div class="flex items-center h-5">
                          <input id="typewriter" type="checkbox" 
                                 [ngModel]="settingsService.typewriterMode()"
                                 (ngModelChange)="settingsService.typewriterMode.set($event)"
                                 class="h-4 w-4 text-accent-600 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500">
                        </div>
                        <div class="ml-3 text-sm">
                          <label for="typewriter" class="font-medium text-gray-700 dark:text-gray-300">Mode Mesin Tik</label>
                          <p class="text-gray-600 dark:text-gray-400">Selalu jaga baris yang Anda ketik di tengah layar.</p>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                }

                @case ('aksesibilitas') {
                  <div class="space-y-6">
                    
                    <fieldset class="space-y-2">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Keterbacaan</legend>
                      <div class="relative flex items-start">
                        <div class="flex items-center h-5">
                          <input id="highContrast" type="checkbox" 
                                 [ngModel]="settingsService.highContrastMode()"
                                 (ngModelChange)="settingsService.highContrastMode.set($event)"
                                 class="h-4 w-4 text-accent-600 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500">
                        </div>
                        <div class="ml-3 text-sm">
                          <label for="highContrast" class="font-medium text-gray-700 dark:text-gray-300">Mode Kontras Tinggi</label>
                          <p class="text-gray-600 dark:text-gray-400">Gunakan palet hitam putih murni untuk kejelasan maksimal.</p>
                        </div>
                      </div>
                    </fieldset>

                  </div>
                }

                @case ('data') {
                   <div class="space-y-6">
                    
                    <fieldset class="space-y-2">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Ekspor Data</legend>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Simpan cadangan data Anda ke file di komputer.</p>

                      <div class="pt-4 space-y-3">
                        <button (click)="handleExportFull()"
                                class="w-full sm:w-auto px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md 
                                       font-semibold transition-colors duration-150
                                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500">
                          Ekspor Backup Lengkap (.json)
                        </button>
                        <p class="text-xs text-gray-500">Mencadangkan SEMUA novel, pengaturan, dan progres.</p>
                        
                        <button class="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md 
                                       text-gray-800 dark:text-gray-200 disabled:opacity-50 cursor-not-allowed" disabled>
                          Ekspor Novel Tunggal (.zip) (Segera Hadir)
                        </button>
                      </div>
                    </fieldset>

                    <fieldset class="space-y-2 border-t border-gray-300 dark:border-gray-700 pt-6">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Impor Data</legend>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Pulihkan data dari file backup (.json) Novelist.</p>
                      <p class="text-sm font-semibold text-red-500 dark:text-red-400">PERINGATAN: Ini akan menghapus dan menimpa SEMUA data yang ada saat ini.</p>

                      <div class="pt-4">
                        <button (click)="triggerImportFile()"
                                class="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md 
                                       font-semibold transition-colors duration-150
                                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                          Impor dari File Backup...
                        </button>
                        
                        <input type="file" #importFileInput 
                               class="hidden" 
                               accept="application/json,.json"
                               (change)="handleFileImport($event)">
                      </div>
                    </fieldset>
                   </div>
                }

              }
            </div>
          </div>

          <!-- FOOTER BARU -->
          <div class="flex-shrink-0 flex justify-between items-center p-6 border-t border-gray-300 dark:border-gray-700 mt-auto bg-gray-50 dark:bg-gray-800/50">
            <button (click)="handleReset()"
                    class="text-sm text-red-600 dark:text-red-400 hover:underline 
                           focus:outline-none focus:ring-2 focus:ring-red-500 rounded">
              Reset Pengaturan ke Default
            </button>
            <button (click)="settingsService.closeModal()"
                    class="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md 
                           font-semibold transition-colors duration-150
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500">
              Tutup
            </button>
          </div>

        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsModalComponent {
  readonly settingsService = inject(SettingsService);
  readonly confirmationService = inject(ConfirmationService);
  private readonly backupService = inject(BackupService);
  private readonly notificationService = inject(NotificationService); // <-- 2. INJECT
  
  activeTab = signal<'tampilan' | 'editor' | 'aksesibilitas' | 'data'>('tampilan');

  @ViewChild('importFileInput') importFileInput!: ElementRef<HTMLInputElement>;

  readonly tabs = TAB_OPTIONS;
  readonly themeOptions = THEME_OPTIONS;
  readonly accentOptions = ACCENT_OPTIONS;
  readonly fontOptions = FONT_OPTIONS;
  readonly uiFontOptions = UI_FONT_OPTIONS;
  readonly autoSaveOptions = AUTO_SAVE_OPTIONS;
  readonly dashboardViewOptions = DASHBOARD_VIEW_OPTIONS;
  readonly dashboardSortOptions = DASHBOARD_SORT_OPTIONS;
  
  handleReset(): void {
    this.confirmationService.requestConfirmation({
      message: 'Yakin ingin mereset semua pengaturan ke default? Semua kustomisasi Anda akan hilang.',
      confirmButtonText: 'Ya, Reset',
      onConfirm: () => {
        this.settingsService.resetToDefaults();
        // 3. TAMPILKAN NOTIFIKASI SETELAH RESET
        this.notificationService.success('Semua pengaturan telah berhasil direset.');
      }
    });
  }

  handleExportFull(): void {
    this.backupService.exportFullBackup();
    this.settingsService.closeModal(); // Tutup modal setelah aksi
  }

  triggerImportFile(): void {
    // Minta konfirmasi SEBELUM memilih file
    this.confirmationService.requestConfirmation({
      message: 'Anda yakin? Ini akan MENIMPA SEMUA data saat ini dengan data dari file backup. Aksi ini tidak bisa dibatalkan.',
      confirmButtonText: 'Ya, Saya Mengerti, Lanjutkan',
      onConfirm: () => {
        // Jika dikonfirmasi, baru klik input file
        this.importFileInput.nativeElement.click();
      }
    });
  }
  
  handleFileImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Serahkan file ke service untuk diproses
      this.backupService.importFullBackup(file);
      
      // Reset input file agar bisa mengimpor file yang sama lagi
      input.value = '';
      this.settingsService.closeModal(); // Tutup modal
    }
  }

  onFontSizeChange(value: string | number): void {
    this.settingsService.editorFontSize.set(Number(value));
  }

  onLineHeightChange(value: string | number): void {
    this.settingsService.editorLineHeight.set(Number(value));
  }
  
  onAutoSaveIntervalChange(value: string | number): void {
    this.settingsService.editorAutoSaveInterval.set(Number(value) as AutoSaveInterval);
  }
}
