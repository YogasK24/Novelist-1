// src/app/pages/dashboard/dashboard.component.ts
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListComponent } from '../../components/dashboard/book-list/book-list.component';
import { AddBookButtonComponent } from '../../components/dashboard/add-book-button/add-book-button.component';
import { AddBookModalComponent } from '../../components/dashboard/add-book-modal/add-book-modal.component';
import type { IBook } from '../../../types/data';
import { SetTargetModalComponent } from '../../components/dashboard/set-target-modal/set-target-modal.component';
import { ThemeService } from '../../state/theme.service';
import { BookStateService } from '../../state/book-state.service';
import { HelpModalComponent } from '../../components/dashboard/help-modal/help-modal.component';
import { OptionsMenuComponent } from '../../components/dashboard/options-menu/options-menu.component';
import { GlobalSearchInputComponent } from '../../components/shared/global-search-input/global-search-input.component';
import { SearchService } from '../../state/search.service';
import { UiStateService, HEADER_OPTIONS_MENU_ID, DASHBOARD_FILTER_MENU_ID } from '../../state/ui-state.service';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { GlobalSearchResultsComponent } from '../../components/shared/global-search-results/global-search-results.component';
import { FilterMenuComponent } from '../../components/dashboard/filter-menu/filter-menu.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { BulkActionBarComponent } from '../../components/dashboard/bulk-action-bar/bulk-action-bar.component';
import { HideOnScrollDirective } from '../../directives/hide-on-scroll.directive';
import { OnboardingService } from '../../state/onboarding.service';
import { LongPressHintComponent } from '../../components/dashboard/long-press-hint/long-press-hint.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BookListComponent,
    AddBookButtonComponent,
    AddBookModalComponent,
    SetTargetModalComponent,
    HelpModalComponent,
    OptionsMenuComponent,
    GlobalSearchInputComponent,
    IconComponent,
    GlobalSearchResultsComponent,
    FilterMenuComponent,
    ClickOutsideDirective,
    BulkActionBarComponent,
    HideOnScrollDirective,
    LongPressHintComponent
  ],
  template: `
    <div #scrollContainer class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 
                transition-colors duration-500 font-sans-ui
                h-screen overflow-y-auto"
         (scroll)="uiState.closeAllMenus()">
      
      <header class="sticky top-0 z-40 bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-black/10 transition-colors duration-500">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
          
          <!-- Left side stage for Logo and Search -->
          <div class="flex-1 relative" (clickOutside)="searchService.closeSearch()">
            
            <!-- Animation container with fixed height and overflow hidden -->
            <div class="relative flex items-center h-9">
              <div class="absolute inset-0 flex items-center h-9 overflow-hidden">
                <!-- Logo Container -->
                <div class="absolute inset-0 flex items-center transform transition-all duration-500 ease-in-out"
                    [class]="logoContainerClasses()">
                  <h1 class="font-logo text-3xl text-accent-600 dark:text-accent-400">
                    Novelist
                  </h1>
                </div>
                
                <!-- Search Container -->
                <div class="absolute inset-y-0 left-0 right-0 flex items-center
                            transform transition-all duration-500 ease-in-out"
                    [class]="searchContainerClasses()"
                    (click)="$event.stopPropagation()">
                  <app-global-search-input class="w-full"></app-global-search-input>
                </div>
              </div>
            </div>

            <!-- Search Results Popover - Moved outside the overflow-hidden container -->
            <app-global-search-results></app-global-search-results>
          </div>
          
          <!-- Right side Action Icons -->
          <div class="flex items-center gap-2">
            
            <!-- Search Toggle Button -->
            <button (click)="handleSearchToggle($event)"
                    [disabled]="uiState.isHeaderAnimating()"
                    class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors z-10 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-900"
                    aria-label="Toggle Search">
              @if (uiState.headerState() === 'searchActive') {
                <app-icon name="outline-x-mark-24" class="w-6 h-6"></app-icon>
              } @else {
                <app-icon name="solid-magnifying-glass-20" class="w-6 h-6"></app-icon>
              }
            </button>
            
            <!-- Other Icons Group -->
            <div class="flex items-center gap-2">
              
              <button (click)="handleHelpClick($event)"
                      [disabled]="uiState.isHeaderAnimating()"
                      aria-label="Bantuan & Informasi"
                      class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-900">
                <app-icon name="outline-help-question-24" class="w-6 h-6"></app-icon>
              </button>
              
              <button (click)="themeService.toggleTheme(); $event.stopPropagation()" 
                      [disabled]="uiState.isHeaderAnimating()"
                      class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-900" 
                      aria-label="Toggle Dark/Light Mode">
                  <span class="relative block w-6 h-6">
                    <app-icon name="outline-light-mode-24"
                              class="absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out"
                              [class.opacity-100]="themeService.activeTheme() === 'dark'"
                              [class.rotate-0]="themeService.activeTheme() === 'dark'"
                              [class.opacity-0]="themeService.activeTheme() === 'light'"
                              [class.-rotate-90]="themeService.activeTheme() === 'light'"></app-icon>
                    <app-icon name="outline-moon-24"
                              class="absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out"
                              [class.opacity-100]="themeService.activeTheme() === 'light'"
                              [class.rotate-0]="themeService.activeTheme() === 'light'"
                              [class.opacity-0]="themeService.activeTheme() === 'dark'"
                              [class.rotate-90]="themeService.activeTheme() === 'dark'"></app-icon>
                  </span>
              </button>
              
              <div class="relative" (clickOutside)="uiState.closeMenu(headerOptionsMenuId)">
                <button (click)="handleOptionsToggle($event)" [disabled]="uiState.isHeaderAnimating()" aria-label="Opsi lainnya" class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-900">
                  <app-icon name="outline-kebab-vertical-24" class="w-6 h-6"></app-icon>
                </button>
                <app-options-menu 
                  [show]="uiState.activeMenuId() === headerOptionsMenuId">
                </app-options-menu>
              </div>
            </div>
          </div>
        </div>
      </header>

      @if(searchService.isSearchActive() && searchService.hasBeenInteractedWith()) {
        <div (click)="searchService.closeSearch()" 
             class="fixed inset-0 z-30 bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-fade-in">
        </div>
      }
      
      <main class="container mx-auto px-4 pt-8 pb-12"
            [class.pb-24]="uiState.isSelectMode()"> 
        
        <div class="flex justify-between items-center mb-6">
           <!-- NEW: Archived View Indicator -->
           <div class="transition-opacity" 
                [class.opacity-0]="uiState.isSelectMode()"
                [class.pointer-events-none]="uiState.isSelectMode()">
             @if(bookState.showArchived()) {
               <div class="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold
                           bg-accent-100 dark:bg-accent-900/40
                           text-accent-700 dark:text-accent-300">
                 <app-icon name="outline-archive-box-24" class="w-4 h-4"></app-icon>
                 <span>Menampilkan Arsip</span>
               </div>
             }
           </div>
           
           <!-- Right side buttons -->
           <div class="flex items-center gap-2">
              <div class="relative transition-opacity" 
                   [class.opacity-0]="uiState.isSelectMode()"
                   [class.pointer-events-none]="uiState.isSelectMode()"
                   (clickOutside)="uiState.closeMenu(filterMenuId)">
                <button (click)="handleFilterMenuToggle($event)"
                        [disabled]="uiState.isHeaderAnimating()"
                        class="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-gray-700 dark:text-gray-300
                              bg-white dark:bg-gray-800
                              border border-gray-300 dark:border-gray-600
                              hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 disabled:opacity-50
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-900">
                  <app-icon name="outline-funnel-24" class="w-5 h-5"></app-icon>
                  <span>Filter</span>
                  @if(bookState.showArchived()) {
                    <span class="block h-2 w-2 rounded-full bg-accent-500"></span>
                  }
                </button>
                <app-filter-menu [show]="uiState.activeMenuId() === filterMenuId"></app-filter-menu>
              </div>

              <div class="flex items-center p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 transition-opacity"
                  [class.opacity-0]="uiState.isSelectMode()"
                  [class.pointer-events-none]="uiState.isSelectMode()">
                <button (click)="bookState.setViewMode('grid')"
                        [class.bg-gray-200]="bookState.viewMode() === 'grid'"
                        [class.dark:bg-gray-700]="bookState.viewMode() === 'grid'"
                        [class.text-accent-600]="bookState.viewMode() === 'grid'"
                        [class.dark:text-accent-400]="bookState.viewMode() === 'grid'"
                        class="p-1.5 rounded-md transition-all duration-200 hover:scale-110 text-gray-500 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400"
                        aria-label="Grid View">
                    <app-icon name="outline-grid-view-24" class="w-5 h-5"></app-icon>
                </button>
                <button (click)="bookState.setViewMode('list')"
                        [class.bg-gray-200]="bookState.viewMode() === 'list'"
                        [class.dark:bg-gray-700]="bookState.viewMode() === 'list'"
                        [class.text-accent-600]="bookState.viewMode() === 'list'"
                        [class.dark:text-accent-400]="bookState.viewMode() === 'list'"
                        class="p-1.5 rounded-md transition-all duration-200 hover:scale-110 text-gray-500 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400"
                        aria-label="List View">
                    <app-icon name="outline-list-view-24" class="w-5 h-5"></app-icon>
                </button>
              </div>
              
              @if (!uiState.isSelectMode()) {
                <button (click)="uiState.enterSelectMode()"
                        class="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400
                              hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                        aria-label="Pilih Novel">
                  <app-icon name="outline-check-circle-24" class="w-5 h-5"></app-icon>
                </button>
              }
           </div>
        </div>

        <app-book-list 
          [viewMode]="bookState.viewMode()"
          [isSelectMode]="uiState.isSelectMode()"
          [selectedIds]="bookState.selectedBookIds()"
          (toggleSelect)="bookState.toggleBookSelection($event)"
          (editClicked)="handleOpenEditModal($event)"
          (setTargetClicked)="handleOpenSetTargetModal($event)"
          (createFirstBookClicked)="handleOpenAddModal()">
        </app-book-list>
      </main>
      
      <app-add-book-button 
        (click)="$event.stopPropagation()" 
        (addClicked)="handleOpenAddModal()"
        [appHideOnScroll]="scrollContainer"
        [class.fab-hidden]="uiState.isSelectMode()"
        class="transition-all duration-300 ease-in-out">
      </app-add-book-button>

      <app-bulk-action-bar></app-bulk-action-bar>

      @if (uiState.isAddEditBookModalOpen()) {
        <app-add-book-modal 
          [bookToEdit]="uiState.editingBook()"
          (closeModal)="uiState.closeBookModal()">
        </app-add-book-modal>
      }

      @if (uiState.isSetTargetModalOpen()) {
        <app-set-target-modal
          [book]="uiState.bookForTarget()"
          (closeModal)="uiState.closeSetTargetModal()">
        </app-set-target-modal>
      }
      
      @if (uiState.isHelpModalOpen()) {
        <app-help-modal
          [show]="uiState.isHelpModalOpen()"
          (closeModal)="uiState.closeHelpModal()">
        </app-help-modal>
      }

      <app-long-press-hint 
        [show]="shouldShowOnboardingHint()"
        (dismiss)="onboardingService.dismissLongPressHint()">
      </app-long-press-hint>
    </div>
  `,
  styles: [`
    .fab-hidden {
      transform: translateY(6rem) scale(0.9);
      opacity: 0;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public readonly themeService = inject(ThemeService); 
  public readonly bookState = inject(BookStateService); 
  public readonly searchService = inject(SearchService);
  public readonly uiState = inject(UiStateService);
  public readonly onboardingService = inject(OnboardingService);
  
  readonly headerOptionsMenuId = HEADER_OPTIONS_MENU_ID;
  readonly filterMenuId = DASHBOARD_FILTER_MENU_ID;

  readonly shouldShowOnboardingHint = computed(() => {
    return this.onboardingService.showLongPressHint() && this.bookState.sortedBooks().length > 0;
  });

  readonly logoContainerClasses = computed(() => {
    const isSearch = this.uiState.headerState() === 'searchActive';
    return {
      'opacity-0': isSearch,
      '-translate-x-full': isSearch,
      'pointer-events-none': isSearch,
      'opacity-100': !isSearch,
      'translate-x-0': !isSearch,
    };
  });

  readonly searchContainerClasses = computed(() => {
    const isSearch = this.uiState.headerState() === 'searchActive';
    return {
      'opacity-100': isSearch,
      'translate-x-0': isSearch,
      'pointer-events-auto': isSearch,
      'opacity-0': !isSearch,
      'translate-x-full': !isSearch,
      'pointer-events-none': !isSearch,
    };
  });

  handleOpenAddModal(): void {
    this.uiState.openAddBookModal();
  }

  handleOpenEditModal(book: IBook): void {
    this.uiState.openEditBookModal(book);
  }

  handleOpenSetTargetModal(book: IBook): void {
    this.uiState.openSetTargetModal(book);
  }

  handleHelpClick(event: MouseEvent): void {
    event.stopPropagation();
    this.uiState.openHelpModal();
  }

  handleFilterMenuToggle(event: MouseEvent): void {
    if (this.uiState.isHeaderAnimating()) return;
    event.stopPropagation();
    this.uiState.toggleMenu(this.filterMenuId);
  }

  handleSearchToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.uiState.toggleHeaderSearch();
  }

  handleOptionsToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.uiState.toggleMenu(this.headerOptionsMenuId);
  }
}
