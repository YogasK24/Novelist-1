// FIX: Implemented the BookViewHeaderComponent to display the current book's title and navigation controls.
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-book-view-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-20">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2 min-w-0">
          <a [routerLink]="['/']" 
             class="flex-shrink-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 -ml-2 rounded-full transition-colors"
             aria-label="Back to Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          @if (bookState.currentBook(); as book) {
            <h1 class="text-xl font-bold text-gray-900 dark:text-white truncate" [title]="book.title">
              {{ book.title }}
            </h1>
          } @else {
             <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
          }
        </div>
        
        @if (bookState.currentBookId(); as bookId) {
            <a [routerLink]="['/book', bookId, 'write']" 
                class="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150 text-sm font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Write</span>
            </a>
        }
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookViewHeaderComponent {
  bookState = inject(CurrentBookStateService);
}
