// src/app/components/dashboard/help-modal/help-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { FocusTrapDirective } from '../../../directives/focus-trap.directive';
import { HelpContentService, type HelpTip } from '../../../state/help-content.service';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule, IconComponent, FocusTrapDirective],
  template: `
    <div 
      class="fixed inset-0 bg-black/70 flex justify-center items-center z-50
             transition-opacity duration-300"
      [class.opacity-100]="show()"
      [class.opacity-0]="!show()"
      [class.pointer-events-none]="!show()"
      (click)="closeModal.emit()" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        appFocusTrap
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl
               ring-1 ring-black/5 dark:ring-white/10
               transform transition-all duration-300 ease-in-out"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center gap-3">
            <app-icon name="outline-help-question-24" class="w-8 h-8 text-accent-600 dark:text-accent-400" />
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
                Bantuan & Informasi
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">Selamat datang di Aplikasi Novelist!</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500">
            <app-icon name="outline-x-mark-24" class="w-6 h-6" />
          </button>
        </div>

        <div class="max-h-[70vh] overflow-y-auto pr-2 space-y-6 text-gray-700 dark:text-gray-300">
          
           @if (helpContentService.isLoading()) {
            <div class="flex justify-center items-center py-10">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
            </div>
          } @else if (helpContentService.error(); as errorMsg) {
            <div class="text-center py-10">
              <app-icon name="outline-exclamation-circle-24" class="mx-auto h-12 w-12 text-red-400"></app-icon>
              <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-gray-200">Terjadi Kesalahan</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ errorMsg }}</p>
            </div>
          } @else {
            @for (section of helpContent(); track section.title) {
              <div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">{{ section.title }}</h3>
                
                @if (section.isList) {
                  <ul class="list-decimal list-inside space-y-2 text-sm">
                    @for (item of section.content; track $index) {
                      @if (!isTip(item)) {
                        <li [innerHTML]="item"></li>
                      }
                    }
                  </ul>
                } @else {
                  <div class="space-y-4">
                    @for (item of section.content; track $index) {
                      @if (isTip(item)) {
                        <div class="flex items-start gap-3">
                          <app-icon [name]="item.icon" class="w-6 h-6 text-accent-500 flex-shrink-0 mt-0.5"></app-icon>
                          <div>
                            <h4 class="font-semibold text-gray-800 dark:text-gray-200">{{ item.title }}</h4>
                            <p class="text-sm">{{ item.description }}</p>
                          </div>
                        </div>
                      }
                    }
                  </div>
                }
              </div>
            }
          }
        </div>
        
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpModalComponent {
  show = input.required<boolean>();
  context = input<string>('dashboard'); // Default context
  closeModal = output<void>();
  
  public readonly helpContentService = inject(HelpContentService);
  
  helpContent = computed(() => {
    const content = this.helpContentService.content();
    if (!content) return [];
    return content[this.context()] || content['dashboard'] || [];
  });

  /**
   * Type guard untuk template agar dapat membedakan antara string dan objek HelpTip.
   */
  isTip(item: string | HelpTip): item is HelpTip {
    return typeof item === 'object' && item !== null && 'icon' in item;
  }
}
