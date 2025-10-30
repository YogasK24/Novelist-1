// src/app/components/dashboard/options-menu/options-menu.component.ts
import { Component, ChangeDetectionStrategy, input, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookStateService } from '../../../state/book-state.service';

@Component({
  selector: 'app-options-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show()) {
      <div class="absolute top-12 right-0 z-30 w-56 
                  bg-white dark:bg-gray-700 rounded-md shadow-lg 
                  ring-1 ring-black dark:ring-gray-600 ring-opacity-5
                  transform transition-all duration-150 ease-out
                  origin-top-right"
           style="opacity: 1; transform: scale(1);">
        <div class="py-1" role="menu" aria-orientation="vertical" (click)="$event.stopPropagation()">
          
          <button (click)="bookState.toggleShowArchived()"
                  class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-600" 
                  role="menuitem">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500 dark:text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <span>{{ bookState.showArchived() ? 'Hide Archived' : 'Show Archived' }}</span>
          </button>

          <a href="#" (click)="$event.preventDefault()" 
                  class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-600" 
                  role="menuitem">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500 dark:text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Export Data (soon)</span>
          </a>

          <a href="#" (click)="$event.preventDefault()" 
                  class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                         text-gray-700 dark:text-gray-200 
                         hover:bg-gray-100 dark:hover:bg-gray-600" 
                  role="menuitem">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-500 dark:text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>About App (soon)</span>
          </a>
          
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsMenuComponent {
  show = input.required<boolean>();
  bookState = inject(BookStateService);
}