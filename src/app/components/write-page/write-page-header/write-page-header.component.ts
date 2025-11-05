// src/app/components/write-page/write-page-header/write-page-header.component.ts
import { Component, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { UiStateService } from '../../../state/ui-state.service';

@Component({
  selector: 'app-write-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, IconComponent], 
  template: `
    <header class="bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-black/10 sticky top-0 z-40 flex-shrink-0 transition-colors duration-500">
      <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        <!-- Left Group: Navigation & Stats -->
        <div class="flex items-center gap-4">
          @if (bookState.currentBook(); as book) {
            <a [routerLink]="['/book', book.id]" 
               class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition duration-150 p-2 -ml-2 rounded-lg" 
               aria-label="Back to World View">
               <app-icon name="outline-arrow-left-24" class="w-6 h-6"></app-icon>
               <span class="hidden sm:inline">World View</span>
            </a>
          } @else {
             <a [routerLink]="['/']" class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition duration-150 p-2 -ml-2 rounded-lg" aria-label="Back to Dashboard">
               <app-icon name="outline-arrow-left-24" class="w-6 h-6"></app-icon>
               <span class="hidden sm:inline">Dashboard</span>
            </a>
          }

          <!-- Separator -->
          <div class="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>

          <div class="text-sm font-semibold flex items-center justify-center gap-x-4">
              <span class="text-gray-500 dark:text-gray-400 hidden sm:inline">
                  Today: 
                  <span class="text-gray-800 dark:text-gray-200 font-bold">{{ bookState.wordsWrittenToday() | number }}</span> / 
                  <span class="text-gray-800 dark:text-gray-200">{{ bookState.dailyTarget() | number }}</span>
              </span>
              <div class="w-24 bg-gray-300 dark:bg-gray-700 rounded-full h-2.5"> 
                  <div class="bg-accent-500 h-2.5 rounded-full" [style.width.%]="bookState.dailyProgressPercentage()"></div>
              </div>
              <span class="text-accent-600 dark:text-accent-400 font-bold">{{ bookState.dailyProgressPercentage() }}%</span>
          </div>
        </div>

        <!-- Right Group: Actions -->
        <div class="flex items-center gap-2">
          <button (click)="openHelp()" 
                  aria-label="Bantuan & Informasi Editor"
                  class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110">
            <app-icon name="outline-help-question-24" class="w-6 h-6"></app-icon>
          </button>
          
          <button (click)="toggleFocusMode.emit()" 
                  class="px-3 py-1 text-sm rounded-md w-28 text-center transition-colors duration-150
                         flex items-center justify-center gap-1.5 font-semibold"
                  [class.bg-white]="!isFocusMode()" [class.dark:bg-gray-800]="!isFocusMode()"
                  [class.border]="!isFocusMode()" [class.border-gray-300]="!isFocusMode()" [class.dark:border-gray-600]="!isFocusMode()"
                  [class.hover:bg-gray-100]="!isFocusMode()" [class.dark:hover:bg-gray-700]="!isFocusMode()"
                  [class.text-gray-700]="!isFocusMode()" [class.dark:text-gray-300]="!isFocusMode()"
                  
                  [class.bg-accent-600]="isFocusMode()" [class.dark:bg-accent-600]="isFocusMode()" 
                  [class.hover:bg-accent-700]="isFocusMode()" [class.dark:hover:bg-accent-700]="isFocusMode()"
                  [class.text-white]="isFocusMode()" [class.dark:text-white]="isFocusMode()">
                  
            @if (isFocusMode()) {
              <app-icon name="outline-arrows-pointing-in-24" class="w-4 h-4"></app-icon>
              <span>Exit Focus</span>
            } @else {
              <app-icon name="outline-arrows-pointing-out-24" class="w-4 h-4"></app-icon>
               <span>Focus Mode</span>
            }
          </button>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WritePageHeaderComponent {
  bookState = inject(CurrentBookStateService);
  private uiState = inject(UiStateService);
  
  isFocusMode = input.required<boolean>();
  
  toggleFocusMode = output<void>();

  openHelp(): void {
    this.uiState.openHelpModal('editor');
  }
}