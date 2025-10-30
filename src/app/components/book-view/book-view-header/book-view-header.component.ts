// src/app/components/book-view/book-view-header/book-view-header.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { ThemeService } from '../../../state/theme.service';

@Component({
  selector: 'app-book-view-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-gray-800 dark:bg-white shadow-md sticky top-0 z-40 transition-colors duration-500">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <a [routerLink]="['/']" class="text-gray-200 dark:text-gray-800 hover:text-gray-300 dark:hover:text-gray-600 transition duration-150 p-2 -ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 dark:focus:ring-offset-white focus:ring-purple-400" aria-label="Back to Dashboard">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
             <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
           </svg>
        </a>
        <h1 class="text-lg font-semibold text-gray-200 dark:text-gray-900 truncate mx-4 flex-grow text-center">
          {{ bookState.currentBook()?.title || 'Loading...' }}
        </h1>
        <button (click)="themeService.toggleTheme()" 
                class="p-2 text-gray-200 dark:text-gray-800 hover:bg-gray-700/50 dark:hover:bg-gray-200 rounded-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 dark:focus:ring-offset-white focus:ring-purple-400" 
                aria-label="Toggle Dark/Light Mode">
          <span class="relative block w-6 h-6">
            <!-- Sun icon for dark mode -->
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                 [class.opacity-100]="themeService.currentTheme() === 'dark'"
                 [class.rotate-0]="themeService.currentTheme() === 'dark'"
                 [class.opacity-0]="themeService.currentTheme() === 'light'"
                 [class.-rotate-90]="themeService.currentTheme() === 'light'">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Moon icon for light mode -->
            <svg xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                 [class.opacity-100]="themeService.currentTheme() === 'light'"
                 [class.rotate-0]="themeService.currentTheme() === 'light'"
                 [class.opacity-0]="themeService.currentTheme() === 'dark'"
                 [class.rotate-90]="themeService.currentTheme() === 'dark'">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </span>
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookViewHeaderComponent {
  bookState = inject(CurrentBookStateService);
  themeService = inject(ThemeService);
}