// src/app/components/write-page/write-page-header/write-page-header.component.ts
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-write-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-gray-800 shadow-md sticky top-0 z-40 flex-shrink-0">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        @if (bookState.currentBook(); as book) {
          <a [routerLink]="['/book', book.id]" class="flex items-center gap-2 text-white hover:text-gray-300 transition duration-150 p-2 -ml-2 rounded-lg" aria-label="Back to World View">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
             <span class="hidden sm:inline">World View</span>
          </a>
        } @else {
           <a [routerLink]="['/']" class="flex items-center gap-2 text-white hover:text-gray-300 transition duration-150 p-2 -ml-2 rounded-lg" aria-label="Back to Dashboard">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
               <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
             <span class="hidden sm:inline">Dashboard</span>
          </a>
        }
        
        <h1 class="text-lg font-semibold text-white truncate mx-4 text-center">
          {{ bookState.currentBook()?.title || 'Loading...' }}
        </h1>
        
        <div class="w-28 text-right">
           <!-- Placeholder untuk status simpan atau aksi -->
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WritePageHeaderComponent {
  bookState = inject(CurrentBookStateService);
}
