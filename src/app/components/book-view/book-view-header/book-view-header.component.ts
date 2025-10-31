// src/app/components/book-view/book-view-header/book-view-header.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { ThemeService } from '../../../state/theme.service'; 
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-book-view-header',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <header class="bg-gray-800 dark:bg-white shadow-md sticky top-0 z-40 transition-colors duration-500">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <a [routerLink]="['/']" class="text-gray-200 dark:text-gray-800 hover:text-gray-300 dark:hover:text-gray-600 transition duration-150 p-2 -ml-2 rounded-full" aria-label="Back to Dashboard">
           <app-icon name="outline-arrow-left-24" class="w-6 h-6" />
        </a>
        <h1 class="text-lg font-semibold text-gray-200 dark:text-gray-900 truncate mx-4 flex-grow text-center">
          {{ bookState.currentBook()?.title || 'Loading...' }}
        </h1>
        <button (click)="themeService.toggleTheme()" 
                class="p-2 text-gray-200 dark:text-gray-800 hover:bg-gray-700/50 dark:hover:bg-gray-200 rounded-full transition duration-300" 
                aria-label="Toggle Dark/Light Mode">
             @if (themeService.activeTheme() === 'dark') {
               <app-icon name="outline-light-mode-24" class="w-6 h-6" />
             } @else {
               <app-icon name="outline-moon-24" class="w-6 h-6" />
             }
        </button>
      </div>
    </header>
  `
})
export class BookViewHeaderComponent {
  bookState = inject(CurrentBookStateService);
  themeService = inject(ThemeService);
}