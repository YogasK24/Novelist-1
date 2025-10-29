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
    <header class="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40 transition-colors duration-500">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <a [routerLink]="['/']" class="text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition duration-150 p-2 -ml-2 rounded-full" aria-label="Back to Dashboard">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </a>
        <h1 class="text-lg font-semibold text-slate-800 dark:text-white truncate mx-4 flex-grow text-center">
          {{ bookState.currentBook()?.title || 'Loading...' }}
        </h1>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookViewHeaderComponent {
  bookState = inject(CurrentBookStateService);
}