// src/app/components/dashboard/add-book-button/add-book-button.component.ts
import { Component, ChangeDetectionStrategy, output } from '@angular/core';

@Component({
  selector: 'app-add-book-button',
  standalone: true,
  template: `
    <button (click)="addClicked.emit()"
      class="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full 
             h-14 flex items-center justify-center shadow-lg 
             transform hover:scale-105 transition-transform duration-200 z-30
             w-auto px-6 gap-2" aria-label="Add new book">
      
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      
      <span class="font-semibold text-sm tracking-wide">ADD BOOK</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBookButtonComponent {
  addClicked = output<void>();
}
