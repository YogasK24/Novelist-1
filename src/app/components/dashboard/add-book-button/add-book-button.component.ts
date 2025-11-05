// src/app/components/dashboard/add-book-button/add-book-button.component.ts
import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-add-book-button',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="group relative">
      <button (click)="addClicked.emit()"
        class="bg-accent-600 hover:bg-accent-700 text-white rounded-full 
              h-14 w-14 flex items-center justify-center shadow-lg 
              transform transition-transform hover:scale-105
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-900" 
        aria-label="Buat novel baru">
        
        <app-icon name="outline-plus-24" class="w-6 h-6" />
      </button>

      <div class="absolute right-full mr-4 top-1/2 -translate-y-1/2
                  px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white text-sm font-semibold rounded-md shadow-lg
                  opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                  transition-all duration-200 delay-150 pointer-events-none scale-95 group-hover:scale-100 group-focus-within:scale-100 origin-right">
        Buat Novel
        <div class="absolute left-full top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
      </div>
    </div>
  `,
  host: {
    // Positioning classes are moved to the host element
    // so the hide-on-scroll animation works correctly.
    'class': 'fixed bottom-8 right-8 z-30'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBookButtonComponent {
  addClicked = output<void>();
}
