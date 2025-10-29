// src/app/components/dashboard/add-book-button/add-book-button.component.ts
import { Component, ChangeDetectionStrategy, output } from '@angular/core';

@Component({
  selector: 'app-add-book-button',
  standalone: true,
  template: `
    <button (click)="addClicked.emit()"
      class="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg transform hover:scale-110 transition-transform duration-200 z-30"
      aria-label="Add new book">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBookButtonComponent {
  addClicked = output<void>();
}
