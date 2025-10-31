// src/app/pages/dashboard/dashboard.component.ts
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
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
import { UiStateService } from '../../state/ui-state.service';
import { IconComponent } from '../../components/shared/icon/icon.component';

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
    IconComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors duration-500 font-sans-ui">
      
      <header class="sticky top-0 z-40 bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-black/10 transition-colors duration-500">
        <div class="container mx-auto px-4 py-3 max-w-7xl flex justify-between items-center gap-4">
          
          <!-- Left side stage for Logo and Search -->
          <div class="flex-1 flex items-center relative h-9">
            
            <!-- Logo Container -->
            <div class="absolute inset-0 flex items-center transition-opacity duration-300 ease-in-out"
                 [class.opacity-0]="isSearchExpanded()"
                 [class.delay-200]="isSearchExpanded()"
                 [class.invisible]="isSearchExpanded()">
              <h1 class="font-logo text-3xl text-accent-600 dark:text-accent-400">
                Novelist
              </h1>
            </div>
            
            <!-- Search Container -->
            <div class="absolute inset-y-0 left-0 right-0 flex items-center
                        transform transition-transform duration-500 ease-in-out origin-right"
                 [class.scale-x-100]="isSearchExpanded()"
                 [class.scale-x-0]="!isSearchExpanded()"
                 [class.pointer-events-auto]="isSearchExpanded()"
                 [class.pointer-events-none]="!isSearchExpanded()"
                 (click)="$event.stopPropagation()">
              <app-global-search-input class="w-full transition-opacity duration-300"
                                       [class.opacity-100]="isSearchExpanded()"
                                       [class.delay-200]="isSearchExpanded()"
                                       [class.opacity-0]="!isSearchExpanded()"></app-global-search-input>
            </div>

          </div>
          
          <!-- Right side Action Icons -->
          <div class="flex items-center gap-2">
            
            <!-- Search Toggle Button -->
            <button (click)="toggleSearch(); $event.stopPropagation()"
                    class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors z-10"
                    aria-label="Toggle Search">
              @if (isSearchExpanded()) {
                <app-icon name="outline-x-mark-24" class="w-6 h-6"></app-icon>
              } @else {
                <app-icon name="solid-magnifying-glass-20" class="w-6 h-6"></app-icon>
              }
            </button>
            
            <!-- Other Icons Group -->
            <div class="flex items-center gap-2">
              
              <button (click)="handleHelpClick($event)"
                      class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <app-icon name="outline-help-question-24" class="w-6 h-6"></app-icon>
              </button>
              
              <button (click)="themeService.toggleTheme(); $event.stopPropagation()" 
                      class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors" 
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
              
              <div class="relative">
                <button #optionsMenuTrigger (click)="handleOptionsToggle($event)" class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                  <app-icon name="outline-kebab-vertical-24" class="w-6 h-6"></app-icon>
                </button>
                <app-options-menu 
                  [show]="uiState.activeMenuId() === 'headerOptions'" 
                  [triggerElement]="optionsMenuTrigger">
                </app-options-menu>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 pt-8 pb-12 max-w-7xl"> 
        
        <div class="flex justify-between items-center mb-6">
           <div class="flex items-center gap-2 sm:gap-4">
             <!-- Tombol Urutkan: Last Modified -->
             <button (click)="bookState.setSort('lastModified')"
                     [class.text-accent-600]="bookState.sortConfig().mode === 'lastModified'"
                     [class.dark:text-accent-400]="bookState.sortConfig().mode === 'lastModified'"
                     [class.text-gray-700]="bookState.sortConfig().mode !== 'lastModified'"
                     [class.dark:text-gray-300]="bookState.sortConfig().mode !== 'lastModified'"
                     class="flex items-center gap-1 font-semibold hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
               <span>Last Modified</span>
               @if (bookState.sortConfig().mode === 'lastModified') {
                 @if (bookState.sortConfig().direction === 'desc') {
                   <app-icon name="outline-arrow-down-24" class="w-4 h-4"></app-icon>
                 } @else {
                   <app-icon name="outline-arrow-up-24" class="w-4 h-4"></app-icon>
                 }
               }
             </button>
             <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
             <!-- Tombol Urutkan: Title -->
             <button (click)="bookState.setSort('title')"
                     [class.text-accent-600]="bookState.sortConfig().mode === 'title'"
                     [class.dark:text-accent-400]="bookState.sortConfig().mode === 'title'"
                     [class.text-gray-700]="bookState.sortConfig().mode !== 'title'"
                     [class.dark:text-gray-300]="bookState.sortConfig().mode !== 'title'"
                     class="flex items-center gap-1 font-semibold hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
               <span>Title</span>
               @if (bookState.sortConfig().mode === 'title') {
                 @if (bookState.sortConfig().direction === 'asc') {
                   <app-icon name="outline-arrow-up-24" class="w-4 h-4"></app-icon>
                 } @else {
                   <app-icon name="outline-arrow-down-24" class="w-4 h-4"></app-icon>
                 }
               }
             </button>
           </div>
           
           <div class="flex items-center gap-2">
              <!-- Grid View Button -->
              <button (click)="bookState.setViewMode('grid')"
                      [class.bg-accent-100]="bookState.viewMode() === 'grid'"
                      [class.dark:bg-gray-800]="bookState.viewMode() === 'grid'"
                      [class.text-accent-600]="bookState.viewMode() === 'grid'"
                      [class.dark:text-accent-400]="bookState.viewMode() === 'grid'"
                      [class.text-gray-500]="bookState.viewMode() !== 'grid'"
                      [class.hover:bg-gray-200]="bookState.viewMode() !== 'grid'"
                      [class.dark:hover:bg-gray-800]="bookState.viewMode() !== 'grid'"
                      [class.hover:text-accent-600]="bookState.viewMode() !== 'grid'"
                      [class.dark:hover:text-accent-400]="bookState.viewMode() !== 'grid'"
                      class="p-2 rounded-md transition-colors"
                      aria-label="Grid View">
                <app-icon name="outline-grid-view-24" class="w-5 h-5"></app-icon>
              </button>
              <!-- List View Button -->
              <button (click)="bookState.setViewMode('list')"
                      [class.bg-accent-100]="bookState.viewMode() === 'list'"
                      [class.dark:bg-gray-800]="bookState.viewMode() === 'list'"
                      [class.text-accent-600]="bookState.viewMode() === 'list'"
                      [class.dark:text-accent-400]="bookState.viewMode() === 'list'"
                      [class.text-gray-500]="bookState.viewMode() !== 'list'"
                      [class.hover:bg-gray-200]="bookState.viewMode() !== 'list'"
                      [class.dark:hover:bg-gray-800]="bookState.viewMode() !== 'list'"
                      [class.hover:text-accent-600]="bookState.viewMode() !== 'list'"
                      [class.dark:hover:text-accent-400]="bookState.viewMode() !== 'list'"
                      class="p-2 rounded-md transition-colors"
                      aria-label="List View">
                <app-icon name="outline-list-view-24" class="w-5 h-5"></app-icon>
              </button>
           </div>
        </div>

        <app-book-list 
          [viewMode]="bookState.viewMode()"
          (editClicked)="handleOpenEditModal($event)"
          (setTargetClicked)="handleOpenSetTargetModal($event)">
        </app-book-list>
      </main>
      
      <app-add-book-button (click)="$event.stopPropagation()" (addClicked)="handleOpenAddModal()"></app-add-book-button>

      @if (showModal()) {
        <app-add-book-modal 
          [bookToEdit]="editingBook()"
          (closeModal)="handleCloseModal()">
        </app-add-book-modal>
      }

      @if (showSetTargetModal()) {
        <app-set-target-modal
          [book]="bookForTarget()"
          (closeModal)="handleCloseSetTargetModal()">
        </app-set-target-modal>
      }
      
      @if (showHelpModal()) {
        <app-help-modal
          [show]="showHelpModal()"
          (closeModal)="showHelpModal.set(false)">
        </app-help-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  showModal = signal(false);
  editingBook = signal<IBook | null>(null);

  showSetTargetModal = signal(false);
  bookForTarget = signal<IBook | null>(null);
  
  showHelpModal = signal(false);
  isSearchExpanded = signal(false);
  
  themeService = inject(ThemeService); 
  bookState = inject(BookStateService); 
  private readonly searchService = inject(SearchService);
  uiState = inject(UiStateService);

  handleHelpClick(event: MouseEvent): void {
    event.stopPropagation();
    this.uiState.closeAllMenus(); // Tutup menu lain
    this.showHelpModal.set(true);
  }

  handleOptionsToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.uiState.toggleMenu('headerOptions');
  }

  toggleSearch(): void {
    this.isSearchExpanded.update(v => !v);
    if (!this.isSearchExpanded()) {
      this.searchService.closeSearch();
    }
  }

  handleOpenAddModal(): void {
    this.uiState.closeAllMenus();
    this.editingBook.set(null);
    this.showModal.set(true);
  }

  handleOpenEditModal(book: IBook): void {
    this.uiState.closeAllMenus();
    this.editingBook.set(book);
    this.showModal.set(true);
  }

  handleCloseModal(): void {
    this.showModal.set(false);
    setTimeout(() => this.editingBook.set(null), 300); 
  }

  handleOpenSetTargetModal(book: IBook): void {
    this.uiState.closeAllMenus();
    this.bookForTarget.set(book);
    this.showSetTargetModal.set(true);
  }

  handleCloseSetTargetModal(): void {
    this.showSetTargetModal.set(false);
    setTimeout(() => this.bookForTarget.set(null), 300);
  }
}
