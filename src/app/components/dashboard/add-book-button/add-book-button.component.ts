// src/app/components/dashboard/add-book-button/add-book-button.component.ts
import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-add-book-button',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button (click)="addClicked.emit()"
      class="fixed bottom-8 right-8 bg-accent-600 hover:bg-accent-700 text-white rounded-full 
             h-14 flex items-center justify-center shadow-lg 
             transform hover:scale-105 transition-transform duration-200 z-30
             w-auto px-6 gap-2" 
      aria-label="Add new book">
      
      <app-icon name="outline-plus-24" class="w-6 h-6" />
      
      <span class="font-semibold text-sm tracking-wide">ADD BOOK</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBookButtonComponent {
  addClicked = output<void>();
}
