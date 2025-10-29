// src/app/components/write-page/write-page-header/write-page-header.component.ts
import { Component, ChangeDetectionStrategy, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-write-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40 border-b border-gray-200 dark:border-transparent">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between">
            <a [routerLink]="['/book', bookState.currentBookId()]" 
                class="text-gray-800 dark:text-white hover:text-purple-600 dark:hover:text-gray-300 transition duration-150 p-2 -ml-2 rounded-full" 
                aria-label="Kembali ke World Building">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </a>
            
            <div class="flex-grow text-center text-sm font-semibold flex items-center justify-center gap-x-4">
                <span class="text-gray-500 dark:text-gray-400">
                    Today: 
                    <span class="text-gray-900 dark:text-white font-bold">{{ bookState.wordsWrittenToday() | number }}</span> / 
                    <span class="text-gray-900 dark:text-white">{{ bookState.dailyTarget() | number }}</span>
                </span>
                <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div class="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full" [style.width.%]="bookState.dailyProgressPercentage()"></div>
                </div>
                <span class="text-purple-600 dark:text-purple-400 font-bold">{{ bookState.dailyProgressPercentage() }}%</span>
            </div>
            
            <button (click)="toggleFocusMode.emit()" 
                    class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded w-28 text-center text-gray-800 dark:text-gray-200">
                {{ isFocusMode() ? 'Exit Focus' : 'Focus Mode' }}
            </button>
        </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WritePageHeaderComponent {
  public bookState = inject(CurrentBookStateService);
  isFocusMode = input.required<boolean>();
  toggleFocusMode = output<void>();
}
