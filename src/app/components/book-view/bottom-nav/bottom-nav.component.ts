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
    @if (bookState.currentBookId(); as bookId) {
      <nav class="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 shadow-inner z-40">
        <div class="container mx-auto flex justify-around items-center h-16 text-sm">
           <a [routerLink]="['/book', bookId]" 
              routerLinkActive="text-accent-400 font-semibold" 
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-slate-400 hover:text-white transition px-2 py-1 text-center focus:outline-none focus:text-white focus:bg-slate-700 rounded-md">World</a>

           <a [routerLink]="['/book', bookId, 'write']" 
              routerLinkActive="text-accent-400 font-semibold" 
              class="text-slate-400 hover:text-white transition px-2 py-1 text-center focus:outline-none focus:text-white focus:bg-slate-700 rounded-md">Write</a>

           <a class="text-slate-600 px-2 py-1 text-center cursor-not-allowed">Organize</a> 
           <a class="text-slate-600 px-2 py-1 text-center cursor-not-allowed">Schedule</a> 

           </div>
      </nav>
    }
  `
})
export class BottomNavComponent {
  bookState = inject(CurrentBookStateService);
}