// src/app/components/write-page/write-page-header/write-page-header.component.ts
import { Component, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-write-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe], 
  template: `
    <header class="bg-gray-800 dark:bg-white shadow-lg sticky top-0 z-40 flex-shrink-0 transition-colors duration-500">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        @if (bookState.currentBook(); as book) {
          <a [routerLink]="['/book', book.id]" 
             class="flex items-center gap-2 text-gray-200 dark:text-gray-800 hover:text-gray-300 dark:hover:text-gray-600 transition duration-150 p-2 -ml-2 rounded-lg" 
             aria-label="Back to World View">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
             <span class="hidden sm:inline">World View</span>
          </a>
        } @else {
           <a [routerLink]="['/']" class="flex items-center gap-2 text-gray-200 dark:text-gray-800 hover:text-gray-300 dark:hover:text-gray-600 transition duration-150 p-2 -ml-2 rounded-lg" aria-label="Back to Dashboard">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
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
                  <div class="bg-purple-500 h-2.5 rounded-full" [style.width.%]="bookState.dailyProgressPercentage()"></div>
              </div>
              <span class="text-purple-400 font-bold">{{ bookState.dailyProgressPercentage() }}%</span>
          </div>

        <button (click)="toggleFocusMode.emit()" 
                class="px-3 py-1 text-sm rounded w-28 text-center transition-colors duration-150
                       flex items-center justify-center gap-1.5"
                [class.bg-gray-700]="!isFocusMode()" [class.dark:bg-gray-200]="!isFocusMode()" 
                [class.hover:bg-gray-600]="!isFocusMode()" [class.dark:hover:bg-gray-300]="!isFocusMode()"
                [class.text-gray-200]="!isFocusMode()" [class.dark:text-gray-800]="!isFocusMode()"
                
                [class.bg-purple-600]="isFocusMode()" [class.dark:bg-purple-500]="isFocusMode()" 
                [class.hover:bg-purple-700]="isFocusMode()" [class.dark:hover:bg-purple-600]="isFocusMode()"
                [class.text-white]="isFocusMode()">
                
          @if (isFocusMode()) {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            <span>Exit Focus</span>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
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
  
  // Input untuk status mode fokus
  isFocusMode = input.required<boolean>();
  
  // Output untuk toggle mode fokus
  toggleFocusMode = output<void>();
}