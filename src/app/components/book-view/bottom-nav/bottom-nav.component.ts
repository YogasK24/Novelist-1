// src/app/components/book-view/bottom-nav/bottom-nav.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Untuk async pipe
import { RouterLink, RouterLinkActive } from '@angular/router'; // Import RouterLinkActive
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    @if (bookState.currentBookId$ | async; as bookId) {
      <nav class="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-white/10 shadow-inner z-40">
        <div class="container mx-auto flex justify-around items-center h-16 text-sm">
           <!-- Link Navigasi -->
           <a [routerLink]="['/book', bookId]" 
              routerLinkActive="text-purple-400 font-semibold" 
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-gray-400 hover:text-white transition px-2 py-1 text-center">World</a>

           <a [routerLink]="['/book', bookId, 'write']" 
              routerLinkActive="text-purple-400 font-semibold" 
              class="text-gray-400 hover:text-white transition px-2 py-1 text-center">Write</a>

           <a class="text-gray-600 px-2 py-1 text-center cursor-not-allowed">Organize</a> 
           <a class="text-gray-600 px-2 py-1 text-center cursor-not-allowed">Schedule</a> 

           <!-- Tombol FAB Biru bisa ditambahkan di tengah dengan styling absolute -->
        </div>
      </nav>
    }
  `
})
export class BottomNavComponent {
  bookState = inject(CurrentBookStateService);
}