// src/app/components/shared/settings-modal/settings-modal.component.ts
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, type EditorFont, type ThemeSetting, type AccentPalette } from '../../../state/settings.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
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
            <button (click)="settingsService.closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500">
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
                      class="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
                      [class.bg-accent-100]="activeTab() === tab.id"
                      [class.dark:bg-accent-900/30]="activeTab() === tab.id"
                      [class.text-accent-700]="activeTab() === tab.id"
                      [class.dark:text-accent-300]="activeTab() === tab.id"
                      [class.font-semibold]="activeTab() === tab.id"
                      [class.text-gray-600]="activeTab() !== tab.id"
                      [class.dark:text-gray-400]="activeTab() !== tab.id"
                      [class.hover:bg-gray-200]="activeTab() !== tab.id"
                      [class.dark:hover:bg-gray-700]="activeTab() !== tab.id"
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
                  </div>
                }

                @case ('editor') {
                  <div class="space-y-6">
                    <fieldset class="space-y-4">
                      <legend class="text-lg font-semibold text-gray-900 dark:text-gray-200">Kustomisasi Editor</legend>
                      
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
                        <input type="range" id="fontSize" min="0.875" max="1.5" step="0.125"
                               [ngModel]="settingsService.editorFontSize()"
                               (ngModelChange)="settingsService.editorFontSize.set(Number($event))"
                               class="w-full sm:w-2/3 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent-600">
                      </div>

                      <div>
                        <label for="lineHeight" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Jarak Baris ({{ settingsService.editorLineHeight() }}x)
                        </label>
                        <input type="range" id="lineHeight" min="1.4" max="2.2" step="0.1"
                               [ngModel]="settingsService.editorLineHeight()"
                               (ngModelChange)="settingsService.editorLineHeight.set(Number($event))"
                               class="w-full sm:w-2/3 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-accent-600">
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
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsModalComponent {
  readonly settingsService = inject(SettingsService);

  activeTab = signal<'tampilan' | 'editor'>('tampilan');

  readonly tabs = [
    { id: 'tampilan', label: 'Tampilan', iconName: 'outline-settings-sliders-24' },
    { id: 'editor', label: 'Editor', iconName: 'solid-pencil-20' }
  ];

  readonly themeOptions: { value: ThemeSetting, label: string }[] = [
    { value: 'light', label: 'Terang' },
    { value: 'dark', label: 'Gelap' },
    { value: 'system', label: 'Sesuai Sistem' },
  ];

  readonly accentOptions: { value: AccentPalette, label: string, color: string }[] = [
    { value: 'purple', label: 'Ungu (Default)', color: '#a855f7' },
    { value: 'blue', label: 'Biru Tenang', color: '#3b82f6' },
    { value: 'green', label: 'Hijau Hutan', color: '#22c55e' },
    { value: 'orange', label: 'Oranye Hangat', color: '#f97316' },
  ];
  
  readonly fontOptions: EditorFont[] = ['Lora', 'Inter', 'Merriweather', 'Source Serif Pro'];
}
