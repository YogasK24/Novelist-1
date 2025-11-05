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
    <header class="bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-black/10 sticky top-0 z-40 transition-colors duration-500">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <a [routerLink]="['/']" class="text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition duration-150 p-2 -ml-2 rounded-full" aria-label="Back to Dashboard">
           <app-icon name="outline-arrow-left-24" class="w-6 h-6" />
        </a>
        <h1 class="font-logo text-3xl text-accent-600 dark:text-accent-400 truncate mx-4 flex-grow text-center">
          {{ bookState.currentBook()?.title || 'Loading...' }}
        </h1>
        <button (click)="themeService.toggleTheme()" 
                class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110" 
                aria-label="Toggle Dark/Light Mode">
            <span class="relative block w-6 h-6">
              <app-icon name="outline-light-mode-24"
                        class="absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out"
                        [class.opacity-100]="themeService.activeTheme() === 'dark'"
                        [class.rotate-0]="themeService.activeTheme() === 'dark'"
                        [class.opacity-0]="themeService.activeTheme() === 'light'"
                        [class.-rotate-90]="themeService.activeTheme() === 'light'"></app-icon>
              <app-icon name="outline-moon-24"
                        class="absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out"
                        [class.opacity-100]="themeService.activeTheme() === 'light'"
                        [class.rotate-0]="themeService.activeTheme() === 'light'"
                        [class.opacity-0]="themeService.activeTheme() === 'dark'"
                        [class.rotate-90]="themeService.activeTheme() === 'dark'"></app-icon>
            </span>
        </button>
      </div>
    </header>
  `
})
export class BookViewHeaderComponent {
  bookState = inject(CurrentBookStateService);
  themeService = inject(ThemeService);
}