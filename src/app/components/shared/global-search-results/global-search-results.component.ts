// src/app/components/shared/global-search-results/global-search-results.component.ts
import { Component, ChangeDetectionStrategy, inject, computed, effect, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SearchService } from '../../../state/search.service';
import type { ISearchResult, SearchResultType } from '../../../../types/data';
import { HighlightPipe } from '../../../pipes/highlight.pipe';

// Tipe yang diperbarui untuk menyertakan flatIndex
export interface IGroupedSearchResult {
  type: SearchResultType;
  results: (ISearchResult & { flatIndex: number })[];
}

@Component({
  selector: 'app-global-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink, HighlightPipe],
  template: `
    @if (searchService.isSearchActive()) {
      <div 
        class="absolute top-full mt-2 w-full max-w-lg left-1/2 -translate-x-1/2 z-50
               transform transition-all duration-200 ease-out"
        [class.opacity-100]="searchService.isSearchActive()"
        [class.scale-100]="searchService.isSearchActive()"
        [class.opacity-0]="!searchService.isSearchActive()"
        [class.scale-95]="!searchService.isSearchActive()"
        [class.pointer-events-auto]="searchService.isSearchActive()"
        [class.pointer-events-none]="!searchService.isSearchActive()"
        (click)="$event.stopPropagation()"
      >
        <div 
          class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl 
                 ring-1 ring-black/5 dark:ring-white/10"
        >
          <div #scrollContainer class="max-h-[60vh] overflow-y-auto p-2">
            @if (searchService.isSearching()) {
              <div class="p-2 space-y-2">
                @for (_ of [1,2,3,4]; track $index) {
                  <div class="flex items-center space-x-3 p-3">
                    <div class="shimmer flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div class="flex-1 min-w-0 space-y-2">
                      <div class="shimmer h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div class="shimmer h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (groupedResults(); as groups) {
              @if (groups.length > 0) {
                <div class="space-y-2">
                  @for (group of groups; track group.type) {
                    <div>
                      <h3 class="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {{ group.type }}
                      </h3>
                      <ul>
                        @for (result of group.results; track result.entityId + result.type) {
                          <li [attr.data-index]="result.flatIndex" 
                              class="search-result-item" 
                              [style.animation-delay]="result.flatIndex * 30 + 'ms'">
                            <a [routerLink]="searchService.getLinkPath(result)" 
                               (click)="onResultClick(result)"
                               class="block p-3 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-accent-500"
                               [class.bg-gray-100]="result.flatIndex === searchService.activeIndex()"
                               [class.dark:bg-gray-700/50]="result.flatIndex === searchService.activeIndex()"
                               [class.hover:bg-gray-100]="result.flatIndex !== searchService.activeIndex()"
                               [class.dark:hover:bg-gray-700/50]="result.flatIndex !== searchService.activeIndex()">
                              
                              <div class="flex items-center space-x-3">
                                <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full 
                                             bg-accent-100 dark:bg-accent-900 
                                             text-accent-600 dark:text-accent-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                                    @switch (result.type) {
                                      @case ('Book') { <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> }
                                      @case ('Character') { <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> }
                                      @case ('Location') { <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.22.655-.368.201-.115.406-.238.6-.371.192-.132.378-.272.553-.417l1.026-.859c.092-.076.183-.153.271-.231l.01-.01.004-.004c.06-.05.118-.1.173-.154l.023-.023a1.48 1.48 0 00.16-.165c.04-.044.078-.09.114-.138l.001-.001.001-.001c.11-.15.21-.308.302-.475l.003-.006a1.498 1.498 0 00.15-.31c.02-.05.038-.1.055-.154l.003-.008a1.5 1.5 0 00.044-.19c.01-.06.018-.12.024-.182l.002-.007a1.5 1.5 0 00.02-.204c.002-.07.004-.14.004-.21v-.002a7 7 0 00-14 0c0 .07.002.14.004.21v.002l.002.007c.006.06.013.12.023.182.006.05.013.1.02.15l.002.006.002.007c.01.06.02.12.03.18a1.5 1.5 0 00.045.19c.006.05.013.1.02.15l.002.006.004.008c.02.05.04.1.06.15l.003-.004.008.008c.04.04.08.09.12.14l.002.002.003.003a1.48 1.48 0 00.16-.165l.023.023c.05.05.11.1.17.15l.003.003.006.004c.09.08.18.15.27.23l.002.002 1.026.86c.17.14.36.28.55.41l.002.002c.19.13.39.25.6.37a7.22 7.22 0 00.65.37l.02.01.03.01a5.74 5.74 0 00.28.14l.017.008.007.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" /> }
                                      @case ('Chapter') { <path fill-rule="evenodd" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" clip-rule="evenodd" /> }
                                      @case ('PlotEvent') { <path fill-rule="evenodd" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" clip-rule="evenodd" /> }
                                      @case ('Theme') { <path fill-rule="evenodd" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 004 2.48zM12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" clip-rule="evenodd" /> }
                                      @case ('Prop') { <path fill-rule="evenodd" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" clip-rule="evenodd" /> }
                                    }
                                  </svg>
                                </span>
                                
                                <div class="flex-1 min-w-0">
                                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate"
                                     [innerHTML]="result.name | highlight:searchService.searchTerm()">
                                  </p>
                                  <p class="text-sm text-gray-600 dark:text-gray-400 truncate"
                                     [innerHTML]="result.path | highlight:searchService.searchTerm()">
                                  </p>
                                </div>
                              </div>
                            </a>
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </div>
              } @else if (searchService.searchTerm()) {
                <div class="flex flex-col justify-center items-center text-center py-10 px-4">
                    <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-8 h-8 text-gray-400 dark:text-gray-500">
                          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9zm4.22-3.22a.75.75 0 00-1.06 1.06L7.94 9 6.16 10.78a.75.75 0 101.06 1.06L9 10.06l1.78 1.78a.75.75 0 101.06-1.06L10.06 9l1.78-1.78a.75.75 0 00-1.06-1.06L9 7.94 7.22 6.22z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">
                        Tidak ada hasil untuk "{{ searchService.searchTerm() }}"
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Coba periksa ejaan Anda atau gunakan kata kunci lain.</p>
                </div>
              } @else if (searchService.recentSearches().length > 0) {
                  <div class="space-y-2">
                    <div class="flex justify-between items-center px-3 pt-2 pb-1">
                      <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Pencarian Terakhir
                      </h3>
                      <button (click)="searchService.clearSearchHistory()" 
                              class="text-xs font-semibold text-accent-600 dark:text-accent-400 hover:underline">
                        Bersihkan
                      </button>
                    </div>
                    <ul>
                      @for (result of searchService.recentSearches(); track result.entityId + result.type; let i = $index) {
                        <li class="search-result-item" [style.animation-delay]="i * 30 + 'ms'">
                          <a [routerLink]="searchService.getLinkPath(result)" 
                             [queryParams]="getEditQueryParams(result)"
                             (click)="onResultClick(result)"
                             class="flex items-center p-3 rounded-lg transition-colors duration-150 group
                                    hover:bg-gray-100 dark:hover:bg-gray-700/50">
                            
                            <div class="flex-grow flex items-center space-x-3 min-w-0">
                               <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full 
                                            bg-gray-100 dark:bg-gray-700 
                                            text-gray-500 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                                  @switch (result.type) {
                                    @case ('Book') { <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> }
                                    @case ('Character') { <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> }
                                    @case ('Location') { <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.22.655-.368.201-.115.406-.238.6-.371.192-.132.378-.272.553-.417l1.026-.859c.092-.076.183-.153.271-.231l.01-.01.004-.004c.06-.05.118-.1.173-.154l.023-.023a1.48 1.48 0 00.16-.165c.04-.044.078-.09.114-.138l.001-.001.001-.001c.11-.15.21-.308.302-.475l.003-.006a1.498 1.498 0 00.15-.31c.02-.05.038-.1.055-.154l.003-.008a1.5 1.5 0 00.044-.19c.01-.06.018-.12.024-.182l.002-.007a1.5 1.5 0 00.02-.204c.002-.07.004-.14.004-.21v-.002a7 7 0 00-14 0c0 .07.002.14.004.21v.002l.002.007c.006.06.013.12.023.182.006.05.013.1.02.15l.002.006.002.007c.01.06.02.12.03.18a1.5 1.5 0 00.045.19c.006.05.013.1.02.15l.002.006.004.008c.02.05.04.1.06.15l.003-.004.008.008c.04.04.08.09.12.14l.002.002.003.003a1.48 1.48 0 00.16-.165l.023.023c.05.05.11.1.17.15l.003.003.006.004c.09.08.18.15.27.23l.002.002 1.026.86c.17.14.36.28.55.41l.002.002c.19.13.39.25.6.37a7.22 7.22 0 00.65.37l.02.01.03.01a5.74 5.74 0 00.28.14l.017.008.007.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" /> }
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
                            
                            <button (click)="onEditClick(result, $event)"
                                    class="flex-shrink-0 p-2 -m-2 rounded-full text-gray-400 dark:text-gray-500 
                                           opacity-0 group-hover:opacity-100 transition 
                                           hover:bg-gray-200 dark:hover:bg-gray-600 
                                           hover:text-gray-700 dark:hover:text-gray-200"
                                    aria-label="Edit item">
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                              </svg>
                            </button>

                          </a>
                        </li>
                      }
                    </ul>
                  </div>
              } @else {
                  <div class="flex flex-col justify-center items-center text-center py-10 px-4">
                    <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-8 h-8 text-gray-400 dark:text-gray-500">
                          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <p class="font-semibold text-gray-800 dark:text-gray-200">Mulai ketik untuk mencari</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Cari novel, bab, karakter, dan lainnya.</p>
                  </div>
              }
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host .shimmer {
      position: relative;
      overflow: hidden;
    }
    :host .shimmer::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.2) 20%,
        rgba(255, 255, 255, 0.5) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmer 1.5s infinite;
    }
    :host-context(html.dark) .shimmer::after {
      background-image: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0) 0,
        rgba(255, 255, 255, 0.05) 20%,
        rgba(255, 255, 255, 0.1) 60%,
        rgba(0, 0, 0, 0)
      );
    }
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
    /* Stagger Animation */
    @keyframes resultFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .search-result-item {
      animation: resultFadeIn 0.4s ease-out forwards;
      opacity: 0; /* Mulai tersembunyi */
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchResultsComponent {
  public searchService = inject(SearchService);
  private elementRef = inject(ElementRef);
  private router = inject(Router);

  constructor() {
    effect(() => {
        const activeIndex = this.searchService.activeIndex();
        if (activeIndex === null) return;

        setTimeout(() => {
            const element = this.elementRef.nativeElement.querySelector(`[data-index='${activeIndex}']`);
            element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 0);
    });
  }

  readonly groupedResults = computed(() => {
    const results = this.searchService.searchResults();
    if (!results || results.length === 0) {
      return [];
    }
    const resultsWithIndex = results.map((result, index) => ({ ...result, flatIndex: index }));
    const groups = new Map<SearchResultType, (ISearchResult & { flatIndex: number })[]>();
    for (const result of resultsWithIndex) {
      if (!groups.has(result.type)) {
        groups.set(result.type, []);
      }
      groups.get(result.type)!.push(result);
    }
    const resultGroups: IGroupedSearchResult[] = Array.from(groups.entries()).map(([type, results]) => ({ type, results }));
    const typeOrder: SearchResultType[] = ['Book', 'Chapter', 'Character', 'Location', 'PlotEvent', 'Theme', 'Prop'];
    resultGroups.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type));
    return resultGroups;
  });
  
  onEditClick(result: ISearchResult, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.searchService.addSearchToHistory(result);
    
    if (result.type === 'Book') {
      // Untuk Novel, kita tidak punya modal edit global, jadi arahkan seperti biasa
      this.router.navigate(['/book', result.bookId]);
    } else if (result.type === 'Chapter') {
      // Arahkan ke halaman tulis bab
      this.router.navigate(['/book', result.bookId, 'write', result.entityId]);
    } else {
      // Untuk entitas lain, gunakan query params
      const queryParams = this.getEditQueryParams(result);
      this.router.navigate(['/book', result.bookId], { queryParams });
    }
    
    this.searchService.closeSearch();
  }
  
  getEditQueryParams(result: ISearchResult): { [key: string]: any } | null {
    const tabMap: { [key in SearchResultType]?: string } = {
      'Character': 'characters',
      'Location': 'locations',
      'PlotEvent': 'events',
      'Chapter': 'chapters',
      'Theme': 'themes',
      'Prop': 'props'
    };
    const openTab = tabMap[result.type];
    if (openTab && result.type !== 'Book' && result.type !== 'Chapter') {
        return { openTab, editId: result.entityId };
    }
    return null;
  }

  onResultClick(result: ISearchResult): void {
    this.searchService.addSearchToHistory(result);
    this.searchService.closeSearch();
  }
}
