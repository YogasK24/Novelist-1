// src/app/pages/dashboard/dashboard.component.ts
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { BookListComponent } from '../../components/dashboard/book-list/book-list.component';
import { AddBookButtonComponent } from '../../components/dashboard/add-book-button/add-book-button.component';
import { AddBookModalComponent } from '../../components/dashboard/add-book-modal/add-book-modal.component';
import type { IBook } from '../../../types/data';
import { SetTargetModalComponent } from '../../components/dashboard/set-target-modal/set-target-modal.component';
import { ThemeService } from '../../state/theme.service';
import { BookStateService, type SortMode, type ViewMode } from '../../state/book-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    BookListComponent,
    AddBookButtonComponent,
    AddBookModalComponent,
    SetTargetModalComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors duration-500 font-sans-ui">
      
      <header class="sticky top-0 z-40 bg-gray-100 dark:bg-gray-900 shadow-md dark:shadow-black/10 transition-colors duration-500">
        <div class="container mx-auto px-4 py-3 max-w-7xl flex justify-between items-center">
          <h1 class="font-logo text-3xl text-purple-600 dark:text-purple-400">
            Novelist
          </h1>
          
          <div class="flex items-center gap-2">
            <button class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </button>
            
            <button (click)="themeService.toggleTheme()" 
                    class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors" 
                    aria-label="Toggle Dark/Light Mode">
                 @if (themeService.currentTheme() === 'dark') {
                   <!-- Sun icon for dark mode -->
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                 } @else {
                   <!-- Moon icon for light mode -->
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                   </svg>
                 }
            </button>
            
            <button class="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <main class="container mx-auto px-4 py-12 max-w-7xl"> 
        
        <div class="flex justify-between items-center mb-6">
           <div class="flex items-center gap-2 sm:gap-4">
             <!-- Tombol Urutkan: Last Modified -->
             <button (click)="bookState.setSort('lastModified')"
                     [class.text-purple-600]="bookState.sortConfig().mode === 'lastModified'"
                     [class.dark:text-purple-400]="bookState.sortConfig().mode === 'lastModified'"
                     [class.text-gray-700]="bookState.sortConfig().mode !== 'lastModified'"
                     [class.dark:text-gray-300]="bookState.sortConfig().mode !== 'lastModified'"
                     class="flex items-center gap-1 font-semibold hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
               <span>Last Modified</span>
               @if (bookState.sortConfig().mode === 'lastModified') {
                 @if (bookState.sortConfig().direction === 'desc') {
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
                   </svg>
                 } @else {
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                   </svg>
                 }
               }
             </button>
             <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
             <!-- Tombol Urutkan: Title -->
             <button (click)="bookState.setSort('title')"
                     [class.text-purple-600]="bookState.sortConfig().mode === 'title'"
                     [class.dark:text-purple-400]="bookState.sortConfig().mode === 'title'"
                     [class.text-gray-700]="bookState.sortConfig().mode !== 'title'"
                     [class.dark:text-gray-300]="bookState.sortConfig().mode !== 'title'"
                     class="flex items-center gap-1 font-semibold hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
               <span>Title</span>
               @if (bookState.sortConfig().mode === 'title') {
                 @if (bookState.sortConfig().direction === 'asc') {
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
                   </svg>
                 } @else {
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
                   </svg>
                 }
               }
             </button>
           </div>
           
           <div class="flex items-center gap-2">
              <!-- Grid View Button -->
              <button (click)="bookState.setViewMode('grid')"
                      [class.bg-purple-100]="bookState.viewMode() === 'grid'"
                      [class.dark:bg-gray-800]="bookState.viewMode() === 'grid'"
                      [class.text-purple-600]="bookState.viewMode() === 'grid'"
                      [class.dark:text-purple-400]="bookState.viewMode() === 'grid'"
                      [class.text-gray-500]="bookState.viewMode() !== 'grid'"
                      [class.hover:bg-gray-200]="bookState.viewMode() !== 'grid'"
                      [class.dark:hover:bg-gray-800]="bookState.viewMode() !== 'grid'"
                      [class.hover:text-purple-600]="bookState.viewMode() !== 'grid'"
                      [class.dark:hover:text-purple-400]="bookState.viewMode() !== 'grid'"
                      class="p-2 rounded-md transition-colors"
                      aria-label="Grid View">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                </svg>
              </button>
              <!-- List View Button -->
              <button (click)="bookState.setViewMode('list')"
                      [class.bg-purple-100]="bookState.viewMode() === 'list'"
                      [class.dark:bg-gray-800]="bookState.viewMode() === 'list'"
                      [class.text-purple-600]="bookState.viewMode() === 'list'"
                      [class.dark:text-purple-400]="bookState.viewMode() === 'list'"
                      [class.text-gray-500]="bookState.viewMode() !== 'list'"
                      [class.hover:bg-gray-200]="bookState.viewMode() !== 'list'"
                      [class.dark:hover:bg-gray-800]="bookState.viewMode() !== 'list'"
                      [class.hover:text-purple-600]="bookState.viewMode() !== 'list'"
                      [class.dark:hover:text-purple-400]="bookState.viewMode() !== 'list'"
                      class="p-2 rounded-md transition-colors"
                      aria-label="List View">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
           </div>
        </div>

        <app-book-list 
          [viewMode]="bookState.viewMode()"
          (editClicked)="handleOpenEditModal($event)"
          (setTargetClicked)="handleOpenSetTargetModal($event)">
        </app-book-list>
      </main>
      
      <app-add-book-button (addClicked)="handleOpenAddModal()"></app-add-book-button>

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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  showModal = signal(false);
  editingBook = signal<IBook | null>(null);

  showSetTargetModal = signal(false);
  bookForTarget = signal<IBook | null>(null);
  
  themeService = inject(ThemeService);
  bookState = inject(BookStateService);

  handleOpenAddModal(): void {
    this.editingBook.set(null);
    this.showModal.set(true);
  }

  handleOpenEditModal(book: IBook): void {
    this.editingBook.set(book);
    this.showModal.set(true);
  }

  handleCloseModal(): void {
    this.showModal.set(false);
    setTimeout(() => this.editingBook.set(null), 300); 
  }

  handleOpenSetTargetModal(book: IBook): void {
    this.bookForTarget.set(book);
    this.showSetTargetModal.set(true);
  }

  handleCloseSetTargetModal(): void {
    this.showSetTargetModal.set(false);
    setTimeout(() => this.bookForTarget.set(null), 300);
  }
}
