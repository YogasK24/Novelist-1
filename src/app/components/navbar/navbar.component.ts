// src/app/components/navbar/navbar.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { ThemeService } from '../../state/theme.service';
import { GlobalSearchInputComponent } from '../shared/global-search-input/global-search-input.component'; // <-- Import BARU

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, GlobalSearchInputComponent], // <-- Daftarkan BARU
  template: `
    <nav class="bg-gray-800 dark:bg-white shadow-md sticky top-0 z-40 transition-colors duration-500">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
        <a [routerLink]="['/']" class="text-gray-200 dark:text-gray-900 hover:text-gray-300 dark:hover:text-gray-700 transition duration-150 whitespace-nowrap">
          Novelist App
        </a>

        <div class="flex-1 flex justify-center">
          <app-global-search-input></app-global-search-input>
        </div>
        
        <button (click)="themeService.toggleTheme()" 
                class="p-2 rounded-full text-gray-200 dark:text-gray-800 hover:bg-gray-700/50 dark:hover:bg-gray-200 transition duration-300" 
                aria-label="Toggle Dark/Light Mode">
             @if (themeService.currentTheme() === 'dark') {
               <!-- Sun icon for dark mode -->
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
             } @else {
               <!-- Moon icon for light mode -->
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
               </svg>
             }
        </button>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  themeService = inject(ThemeService);
}