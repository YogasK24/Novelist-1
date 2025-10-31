// src/app/components/shared/global-search-input/global-search-input.component.ts
import { Component, ChangeDetectionStrategy, inject, signal, viewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { SearchService } from '../../../state/search.service';

@Component({
  selector: 'app-global-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Daftarkan FormsModule
  template: `
    <div class="relative w-full max-w-lg">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
             class="w-5 h-5 text-gray-400 dark:text-gray-500">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
      </div>
      
      <input
        #searchInput
        type="text"
        placeholder="Cari novel, karakter, bab, lokasi..."
        [ngModel]="searchService.searchTerm()"
        (ngModelChange)="onSearchChange($event)"
        (focus)="onSearchChange(searchService.searchTerm())"
        (keydown.escape)="searchService.closeSearch()"
        class="w-full pl-10 pr-4 py-2 rounded-md 
               bg-gray-200 dark:bg-gray-700 
               text-gray-800 dark:text-gray-200
               border border-transparent
               placeholder-gray-500 dark:placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchInputComponent {
  public searchService = inject(SearchService);
  private searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    effect(() => {
      // Secara otomatis fokus pada input saat komponen ini muncul
      this.searchInput().nativeElement.focus();
    });
  }

  onSearchChange(query: string) {
    this.searchService.search(query);
  }
}