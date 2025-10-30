// src/app/components/dashboard/book-card/book-card.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject, signal, ElementRef } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { IBook } from '../../../../types/data';
import { BookStateService } from '../../../state/book-state.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule],
  template: `
    <div
      (click)="navigateToBook()"
      (keydown.enter)="navigateToBook()"
      role="button"
      tabindex="0"
      [attr.aria-label]="'Buka novel ' + book().title"
      class="relative block bg-white dark:bg-gray-800/50 rounded-lg shadow-lg 
             hover:shadow-xl dark:hover:bg-gray-800 hover:bg-gray-50 
             hover:-translate-y-1 transition-all duration-300 
             h-full flex flex-col p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
      
      <!-- Kebab Menu Button -->
      <div class="absolute top-2 right-2 z-20">
        <button (click)="toggleMenu($event)"
          class="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 
                 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800/50 focus:ring-purple-500"
          aria-haspopup="true"
          [attr.aria-expanded]="isMenuOpen()"
          aria-label="Opsi untuk buku">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        @if (isMenuOpen()) {
          <div
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30">
            <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <button (click)="onSetTarget($event)" class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-green-500"><path fill-rule="evenodd" d="M9 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 019 10zM8.25 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 018.25 10zM10 8.25a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75zM10 9.75a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75zM11.75 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM10 11.75a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75z" clip-rule="evenodd" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM.75 10a9.25 9.25 0 1018.5 0 9.25 9.25 0 00-18.5 0z" /></svg>
                Set Target Harian
              </button>
              <button (click)="onEdit($event)" class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-blue-500"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                Edit Judul
              </button>
              <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button (click)="onDelete($event)" class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.84 0a.75.75 0 01-1.5.06l-.3 7.5a.75.75 0 111.5-.06l.3-7.5z" clip-rule="evenodd" /></svg>
                Hapus Novel
              </button>
            </div>
          </div>
        }
      </div>

      <div class="flex-grow mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-1 
                   hover:text-purple-600 dark:hover:text-purple-300 
                   transition-colors truncate">
          {{ book().title }}
        </h3>
        
        <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mr-1.5 text-gray-400">
             <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h11.5a.75.75 0 00.75-.75v-8.5a.75.75 0 00-.75-.75H4.25zM3.5 6.25c0-.966.784-1.75 1.75-1.75h9.5A1.75 1.75 0 0116.5 6.25v7.5A1.75 1.75 0 0114.75 15.5h-9.5A1.75 1.75 0 013.5 13.75v-7.5zM8 8a.75.75 0 01.75.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75A.75.75 0 018 8zm0 3a.75.75 0 01.75.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75A.75.75 0 018 11z" clip-rule="evenodd" />
           </svg>
           <span>{{ book().wordCount | number }} words</span>
        </div>
      </div>
      
      <p class="text-xs text-gray-500 dark:text-gray-500 mt-2 flex-shrink-0">
        Modified: {{ book().lastModified | date:'shortDate' }}
      </p>

    </div>
  `,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCardComponent {
  book = input.required<IBook>(); 
  editClicked = output<IBook>();
  setTargetClicked = output<IBook>();

  private readonly bookState = inject(BookStateService);
  private readonly elementRef = inject(ElementRef);
  // FIX: Property 'navigate' does not exist on type 'unknown'. Explicitly type the injected Router.
  private readonly router: Router = inject(Router);
  
  isMenuOpen = signal(false);

  navigateToBook(): void {
    // Navigasi hanya jika menu tidak terbuka
    if (!this.isMenuOpen()) {
        this.router.navigate(['/book', this.book().id]);
    }
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.isMenuOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen.update(v => !v);
  }

  onSetTarget(event: MouseEvent): void {
    event.stopPropagation();
    this.setTargetClicked.emit(this.book());
    this.isMenuOpen.set(false);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.editClicked.emit(this.book());
    this.isMenuOpen.set(false);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    const currentBook = this.book();
    this.isMenuOpen.set(false);
    if (window.confirm(`Yakin ingin menghapus "${currentBook.title}" dan semua datanya?`)) {
        if(currentBook.id) {
            this.bookState.deleteBook(currentBook.id);
        }
    }
  }
}