// src/app/components/book-view/book-view-header/book-view-header.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Untuk async pipe
import { RouterLink } from '@angular/router';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-book-view-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-gray-800 shadow-md sticky top-0 z-40">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Tombol Back -->
        <a [routerLink]="['/']" class="text-white hover:text-gray-300 transition duration-150 p-2 -ml-2 rounded-full" aria-label="Back to Dashboard">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </a>
        <!-- Judul Buku (di tengah jika bisa) -->
        <h1 class="text-lg font-semibold text-white truncate mx-4 flex-grow text-center">
          {{ bookState.currentBook()?.title || 'Loading...' }}
        </h1>
        <!-- Placeholder untuk ikon kanan -->
        <div class="w-10"> <!-- Sesuaikan width jika perlu -->
           <!-- Icon mata & titik tiga nanti -->
        </div>
      </div>
    </header>
  `
})
export class BookViewHeaderComponent {
  bookState = inject(CurrentBookStateService);
}
