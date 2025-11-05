// src/app/components/dashboard/options-menu/options-menu.component.ts
import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
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
          
          <button (click)="onOpenStatistics()"
                  class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-600" 
                  role="menuitem">
            <app-icon name="outline-chart-bar-24" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span>Statistik</span>
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
            <app-icon name="outline-info-circle-24" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span>Tentang Aplikasi (soon)</span>
          </a>
          
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsMenuComponent {
  show = input.required<boolean>();

  settingsService = inject(SettingsService);
  private uiState = inject(UiStateService);
  private notificationService = inject(NotificationService);

  onOpenStatistics(): void {
    this.uiState.openStatisticsModal();
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
}
