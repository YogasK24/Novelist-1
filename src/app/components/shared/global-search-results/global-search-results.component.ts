// src/app/components/shared/global-search-results/global-search-results.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SearchService } from '../../../state/search.service';
import type { ISearchResult, SearchResultType } from '../../../../types/data';

@Component({
  selector: 'app-global-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (searchService.showResultsModal()) {
      <div 
        class="fixed inset-0 bg-black/70 flex justify-center items-start z-50 
               transition-opacity duration-300 opacity-100 pt-20"
        (click)="searchService.closeSearch()" 
        aria-modal="true"
        role="dialog"
      >
        <div 
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-full max-w-2xl 
                 ring-1 ring-black/5 dark:ring-white/10
                 transform transition-all duration-300 opacity-100 scale-100"
          (click)="$event.stopPropagation()" 
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-200">
              Hasil Pencarian untuk: "<span class="text-purple-600 dark:text-purple-400">{{ searchService.searchTerm() }}</span>"
            </h2>
            <button (click)="searchService.closeSearch()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="max-h-[60vh] overflow-y-auto">
            @if (searchService.isSearching()) {
              <div class="flex justify-center items-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
              </div>
            } @else if (searchService.searchResults(); as results) {
              @if (results.length > 0) {
                <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                  @for (result of results; track result.entityId + result.type) {
                    <li>
                      <a [routerLink]="getLinkPath(result)" 
                         (click)="onResultClick()"
                         class="block p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-150 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700/50 focus:ring-1 focus:ring-purple-500">
                        
                        <div class="flex items-center space-x-3">
                          <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full 
                                       bg-purple-100 dark:bg-purple-900 
                                       text-purple-600 dark:text-purple-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                              @switch (result.type) {
                                @case ('Book') { <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> }
                                @case ('Character') { <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> }
                                @case ('Location') { <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.22.655-.368.201-.115.406-.238.6-.371.192-.132.378-.272.553-.417l1.026-.859c.092-.076.183-.153.271-.231l.01-.01.004-.004c.06-.05.118-.1.173-.154l.023-.023a1.48 1.48 0 00.16-.165c.04-.044.078-.09.114-.138l.001-.001.001-.001c.11-.15.21-.308.302-.475l.003-.006a1.498 1.498 0 00.15-.31c.02-.05.038-.1.055-.154l.003-.008a1.5 1.5 0 00.044-.19c.01-.06.018-.12.024-.182l.002-.007a1.5 1.5 0 00.02-.204c.002-.07.004-.14.004-.21v-.002a7 7 0 00-14 0c0 .07.002.14.004.21v.002l.002.007c.006.06.013.12.023.182.006.05.013.1.02.15l.002.006.002.007c.01.06.02.12.03.18a1.5 1.5 0 00.045.19c.006.05.013.1.02.15l.002.006.004.008c.02.05.04.1.06.15l.003.004.008.008c.04.04.08.09.12.14l.002.002.003.003a1.48 1.48 0 00.16.165l.023.023c.05.05.11.1.17.15l.003.003.006.004c.09.08.18.15.27.23l.002.002 1.026.86c.17.14.36.28.55.41l.002.002c.19.13.39.25.6.37a7.22 7.22 0 00.65.37l.02.01.03.01a5.74 5.74 0 00.28.14l.017.008.007.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" /> }
                                @case ('Chapter') { <path fill-rule="evenodd" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" clip-rule="evenodd" /> }
                                @case ('PlotEvent') { <path fill-rule="evenodd" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" clip-rule="evenodd" /> }
                                @case ('Theme') { <path fill-rule="evenodd" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 004 2.48zM12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" clip-rule="evenodd" /> }
                                @case ('Prop') { <path fill-rule="evenodd" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" clip-rule="evenodd" /> }
                              }
                            </svg>
                          </span>
                          
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">
                              {{ result.name }}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {{ result.path }}
                            </p>
                          </div>
                        </div>
                      </a>
                    </li>
                  }
                </ul>
              } @else {
                <div class="flex justify-center items-center py-10">
                  <p class="text-gray-500">Tidak ada hasil ditemukan.</p>
                </div>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchResultsComponent {
  public searchService = inject(SearchService);
  private router = inject(Router);

  /**
   * Tentukan path navigasi berdasarkan tipe hasil pencarian.
   */
  getLinkPath(result: ISearchResult): string[] {
    switch (result.type) {
      case 'Book':
        return ['/book', result.bookId.toString()];
      case 'Chapter':
        return ['/book', result.bookId.toString(), 'write', result.entityId.toString()];
      // Semua item world-building lainnya mengarah ke halaman buku (tempat tab berada)
      case 'Character':
      case 'Location':
      case 'PlotEvent':
      case 'Theme':
      case 'Prop':
        return ['/book', result.bookId.toString()];
      default:
        return ['/'];
    }
  }

  /**
   * Panggil closeSearch() saat item diklik untuk menutup modal.
   */
  onResultClick(): void {
    // Sedikit delay untuk memastikan navigasi dimulai sebelum modal hilang
    setTimeout(() => {
      this.searchService.closeSearch();
    }, 50);
  }
}