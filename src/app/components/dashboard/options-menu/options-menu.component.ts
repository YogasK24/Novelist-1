// src/app/components/dashboard/options-menu/options-menu.component.ts
import { Component, ChangeDetectionStrategy, input, inject, OnDestroy, Renderer2, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { BookStateService } from '../../../state/book-state.service';
import { SettingsService } from '../../../state/settings.service';
import { UiStateService } from '../../../state/ui-state.service';
import { NotificationService } from '../../../state/notification.service';

@Component({
  selector: 'app-options-menu',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (show()) {
      <div class="absolute top-12 right-0 z-30 w-56 
                  bg-white dark:bg-gray-700 rounded-md shadow-lg 
                  ring-1 ring-black dark:ring-gray-600 ring-opacity-5
                  transform transition-all duration-150 ease-out
                  origin-top-right"
           style="opacity: 1; transform: scale(1);">
        <div class="py-1" role="menu" aria-orientation="vertical" (click)="$event.stopPropagation()">
          
          <button (click)="onToggleArchived()"
                  class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-600" 
                  role="menuitem">
            <app-icon name="outline-archive-box-24" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span>{{ bookState.showArchived() ? 'Hide Archived' : 'Show Archived' }}</span>
          </button>

          <button (click)="onOpenSettings()"
                  class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-600" 
                  role="menuitem">
            <app-icon name="outline-settings-sliders-24" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span>Settings & Display</span>
          </button>

          <a href="#" (click)="onPlaceholderClick($event)" 
                  class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-600" 
                  role="menuitem">
            <app-icon name="outline-export-data-24" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span>Ekspor Data (soon)</span>
          </a>

          <a href="#" (click)="onPlaceholderClick($event)" 
                  class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-600" 
                  role="menuitem">
            <app-icon name="outline-info-circle-24" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span>Tentang Aplikasi (soon)</span>
          </a>
          
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsMenuComponent implements OnDestroy {
  show = input.required<boolean>();
  triggerElement = input<HTMLElement | undefined>();

  bookState = inject(BookStateService);
  settingsService = inject(SettingsService);
  private uiState = inject(UiStateService);
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);
  private notificationService = inject(NotificationService);
  
  private unlisten: (() => void) | null = null;

  constructor() {
    effect((onCleanup) => {
      if (this.show()) {
        // Tunda pemasangan listener untuk menghindari event klik yang sama yang membuka menu
        // agar tidak langsung menutupnya kembali.
        const timerId = setTimeout(() => {
          if (!this.unlisten) {
            this.unlisten = this.renderer.listen('document', 'click', this.handleGlobalClick);
          }
        }, 0);
        
        onCleanup(() => {
            clearTimeout(timerId);
        });

      } else {
        this.removeGlobalListener();
      }
    });
  }

  ngOnDestroy(): void {
    this.removeGlobalListener();
  }

  onToggleArchived(): void {
    this.bookState.toggleShowArchived();
    this.uiState.closeAllMenus();
  }

  onOpenSettings(): void {
    this.settingsService.openModal();
    this.uiState.closeAllMenus();
  }

  onPlaceholderClick(event: MouseEvent): void {
    event.preventDefault();
    this.notificationService.info('Fitur ini akan segera tersedia!');
    this.uiState.closeAllMenus();
  }

  private removeGlobalListener(): void {
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }
  }
  
  // Menggunakan arrow function untuk menjaga konteks `this` untuk listener
  private handleGlobalClick = (event: MouseEvent): void => {
    const trigger = this.triggerElement();
    const menu = this.elementRef.nativeElement;

    // Jika klik terjadi di luar trigger DAN di luar menu, itu adalah "klik di luar"
    const wasClickOutside = trigger 
      && menu
      && !trigger.contains(event.target as Node) 
      && !menu.contains(event.target as Node);

    if (wasClickOutside) {
      this.uiState.closeAllMenus();
    }
  };
}
