// src/app/components/write-page/write-page-header/write-page-header.component.ts
import { Component, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-write-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, IconComponent], 
  template: `
    <header class="bg-gray-800 dark:bg-white shadow-lg sticky top-0 z-40 flex-shrink-0 transition-colors duration-500">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        @if (bookState.currentBook(); as book) {
          <a [routerLink]="['/book', book.id]" 
             class="flex items-center gap-2 text-gray-200 dark:text-gray-800 hover:text-gray-300 dark:hover:text-gray-600 transition duration-150 p-2 -ml-2 rounded-lg" 
             aria-label="Back to World View">
             <app-icon name="outline-arrow-left-24" class="w-6 h-6"></app-icon>
             <span class="hidden sm:inline">World View</span>
          </a>
        } @else {
           <a [routerLink]="['/']" class="flex items-center gap-2 text-gray-200 dark:text-gray-800 hover:text-gray-300 dark:hover:text-gray-600 transition duration-150 p-2 -ml-2 rounded-lg" aria-label="Back to Dashboard">
             <app-icon name="outline-arrow-left-24" class="w-6 h-6"></app-icon>
             <span class="hidden sm:inline">Dashboard</span>
          </a>
        }
        
        <div class="flex-grow text-center text-sm font-semibold flex items-center justify-center gap-x-4">
              <span class="text-gray-400 dark:text-gray-600 hidden sm:inline">
                  Today: 
                  <span class="text-gray-200 dark:text-gray-900 font-bold">{{ bookState.wordsWrittenToday() | number }}</span> / 
                  <span class="text-gray-200 dark:text-gray-900">{{ bookState.dailyTarget() | number }}</span>
              </span>
              <div class="w-24 bg-gray-700 dark:bg-gray-200 rounded-full h-2.5"> 
                  <div class="bg-accent-500 h-2.5 rounded-full" [style.width.%]="bookState.dailyProgressPercentage()"></div>
              </div>
              <span class="text-accent-400 font-bold">{{ bookState.dailyProgressPercentage() }}%</span>
          </div>

        <button (click)="toggleFocusMode.emit()" 
                class="px-3 py-1 text-sm rounded w-28 text-center transition-colors duration-150
                       flex items-center justify-center gap-1.5"
                [class.bg-gray-700]="!isFocusMode()" [class.dark:bg-gray-200]="!isFocusMode()" 
                [class.hover:bg-gray-600]="!isFocusMode()" [class.dark:hover:bg-gray-300]="!isFocusMode()"
                [class.text-gray-200]="!isFocusMode()" [class.dark:text-gray-800]="!isFocusMode()"
                
                [class.bg-accent-600]="isFocusMode()" [class.dark:bg-accent-500]="isFocusMode()" 
                [class.hover:bg-accent-700]="isFocusMode()" [class.dark:hover:bg-accent-600]="isFocusMode()"
                [class.text-white]="isFocusMode()">
                
          @if (isFocusMode()) {
            <app-icon name="outline-arrows-pointing-in-24" class="w-4 h-4"></app-icon>
            <span>Exit Focus</span>
          } @else {
            <app-icon name="outline-arrows-pointing-out-24" class="w-4 h-4"></app-icon>
             <span>Focus Mode</span>
          }
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WritePageHeaderComponent {
  bookState = inject(CurrentBookStateService);
  
  isFocusMode = input.required<boolean>();
  
  toggleFocusMode = output<void>();
}