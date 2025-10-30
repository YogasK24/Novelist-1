// src/app/components/dashboard/book-list-item/book-list-item.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject, signal } from '@angular/core';
import { DatePipe, CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { IBook } from '../../../../types/data';
import { BookStateService } from '../../../state/book-state.service';

// Interface dari BookStateService (untuk type hint di input)
interface IBookWithStats extends IBook {
  chapterCount?: number;
  characterCount?: number;
  dailyProgressPercentage?: number;
}

@Component({
  selector: 'app-book-list-item',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, DecimalPipe],
  template: `
    @if (book(); as currentBook) {
      <div
        class="group relative flex items-center bg-white dark:bg-gray-800/50 rounded-lg shadow-lg 
              hover:shadow-xl dark:hover:bg-gray-800 hover:bg-gray-50 
              hover:-translate-y-1 transition-all duration-300 
              border border-transparent hover:border-purple-300 dark:hover:border-purple-600">

        <div class="h-24 w-16 flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
               class="w-6 h-6 text-gray-400 dark:text-gray-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
          </svg>
          <div class="absolute top-0 right-0 h-full w-1 bg-purple-500"></div>
        </div>

        <div class="flex-grow p-4 min-w-0">
          <h3 class="text-md font-semibold text-gray-900 dark:text-gray-200 truncate
                     group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            {{ currentBook.title }}
          </h3>
          
          <div class="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
             <div class="flex items-center" title="Total Kata">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1 text-gray-400">
                 <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h11.5a.75.75 0 00.75-.75v-8.5a.75.75 0 00-.75-.75H4.25zM3.5 6.25c0-.966.784-1.75 1.75-1.75h9.5A1.75 1.75 0 0116.5 6.25v7.5A1.75 1.75 0 0114.75 15.5h-9.5A1.75 1.75 0 013.5 13.75v-7.5zM8 8a.75.75 0 01.75.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75A.75.75 0 018 8zm0 3a.75.75 0 01.75.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75A.75.75 0 018 11z" clip-rule="evenodd" />
               </svg>
               <span>{{ currentBook.wordCount | number }}</span>
             </div>
             <div class="flex items-center" title="Total Bab">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1 text-gray-400">
                 <path fill-rule="evenodd" d="M15.98 3.916a.75.75 0 01.447 1.335l-3.003 3.003a.75.75 0 01-1.06 0l-3.003-3.003a.75.75 0 011.06-1.06l1.72 1.72V3.75a.75.75 0 011.5 0v3.172l1.72-1.72a.75.75 0 01.613-.27zM5.25 2A2.25 2.25 0 003 4.25v13.5A2.25 2.25 0 005.25 20h13.5A2.25 2.25 0 0021 17.75V10.5a.75.75 0 00-1.5 0v7.25c0 .414-.336.75-.75.75H5.25c-.414 0-.75-.336.75-.75V4.25c0-.414.336.75.75-.75h4.5a.75.75 0 000-1.5h-4.5z" clip-rule="evenodd" />
               </svg>
               <span>{{ currentBook.chapterCount ?? 0 }}</span>
             </div>
             <div class="flex items-center" title="Total Karakter">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1 text-gray-400">
                 <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 8a3 3 0 100-6 3 3 0 000 6zM1.066 16.59a1.5 1.5 0 012.15-1.793A10.953 10.953 0 008 16.5c.343 0 .681-.01 1.014-.03A1.5 1.5 0 0110.8 17.1a10.953 10.953 0 004.784-1.703 1.5 1.5 0 012.15 1.793A12.452 12.452 0 0110 18c-2.43 0-4.72-.667-6.617-1.84a1.5 1.5 0 01-2.317-.57zM14.5 11.5c.204 0 .4-.006.593-.018a1.5 1.5 0 011.628 1.87A10.953 10.953 0 0018 16.5c.343 0 .681-.01 1.014-.03a1.5 1.5 0 011.628 1.87A12.452 12.452 0 0114.5 18c-1.597 0-3.098-.42-4.42-1.155a1.5 1.5 0 01-.416-2.21 1.5 1.5 0 012.21-.416A10.906 10.906 0 0014.5 16.5c.204 0 .4-.006.593-.018a1.5 1.5 0 011.628 1.87A10.953 10.953 0 0018 16.5c.343 0 .681-.01 1.014-.03a1.5 1.5 0 011.628 1.87A12.452 12.452 0 0114.5 18c-2.43 0-4.72-.667-6.617-1.84a1.5 1.5 0 01-2.317-.57z" />
               </svg>
               <span>{{ currentBook.characterCount ?? 0 }}</span>
             </div>
          </div>
        </div>
        
        <div class="flex-shrink-0 px-4 w-28 text-right">
           <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
            <div class="bg-purple-500 dark:bg-purple-600 h-1.5 rounded-full" 
                 [style.width.%]="currentBook.dailyProgressPercentage ?? 0"></div>
          </div>
          <p class="text-xs text-purple-600 dark:text-purple-400 font-medium">
            {{ currentBook.dailyProgressPercentage ?? 0 }}% Daily
          </p>
        </div>

        <div class="flex-shrink-0 relative">
          <button (click)="toggleMenu($event)" 
                  class="p-2 m-2 rounded-full 
                         text-gray-500 dark:text-gray-400 
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>
          
          @if (showMenu()) {
            <div class="absolute top-12 right-2 z-30 w-48 
                        bg-white dark:bg-gray-700 rounded-md shadow-lg 
                        ring-1 ring-black dark:ring-gray-600 ring-opacity-5
                        transform transition-all duration-150 ease-out
                        origin-top-right"
                 style="opacity: 1; transform: scale(1);">
              <div class="py-1" role="menu" aria-orientation="vertical">
                
                <button (click)="handleAction($event, 'target')" 
                        class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                               text-gray-700 dark:text-gray-200 
                               hover:bg-gray-100 dark:hover:bg-gray-600" 
                        role="menuitem">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-500 dark:text-gray-400">
                    <path fill-rule="evenodd" d="M9 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 019 10zM8.25 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 018.25 10zM10 8.25a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75zM10 9.75a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75zM11.75 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM10 11.75a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM.75 10a9.25 9.25 0 1018.5 0 9.25 9.25 0 00-18.5 0z" />
                  </svg>
                  <span>Set Target</span>
                </button>
                
                <button (click)="handleAction($event, 'edit')" 
                        class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                               text-gray-700 dark:text-gray-200 
                               hover:bg-gray-100 dark:hover:bg-gray-600" 
                        role="menuitem">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-500 dark:text-gray-400">
                    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                  </svg>
                  <span>Edit Title</span>
                </button>
                
                <button (click)="handleAction($event, 'delete')" 
                        class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm 
                               text-red-600 dark:text-red-400 
                               hover:bg-gray-100 dark:hover:bg-gray-600" 
                        role="menuitem">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-red-500 dark:text-red-400">
                    <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.84 0a.75.75 0 01-1.5.06l-.3 7.5a.75.75 0 111.5-.06l.3-7.5z" clip-rule="evenodd" />
                  </svg>
                  <span>Delete Book</span>
                </button>
                
              </div>
            </div>
          }
        </div>

        <a [routerLink]="['/book', currentBook.id]" (click)="closeMenu()" class="absolute inset-0 z-10" [attr.aria-label]="'Open ' + currentBook.title"></a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListItemComponent {
  book = input<IBookWithStats | null>(null); // Gunakan tipe baru
  editClicked = output<IBook>();
  setTargetClicked = output<IBook>();

  private readonly bookStateService = inject(BookStateService); 
  
  showMenu = signal(false);

  toggleMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.showMenu.update(val => !val);
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  handleAction(event: MouseEvent, action: 'edit' | 'target' | 'delete') {
    event.preventDefault();
    event.stopPropagation();
    
    const currentBook = this.book();
    if (!currentBook) return;

    if (action === 'edit') {
      this.editClicked.emit(currentBook as IBook);
    } else if (action === 'target') {
      this.setTargetClicked.emit(currentBook as IBook);
    } else if (action === 'delete') {
      if (window.confirm(`Yakin ingin menghapus "${currentBook.title}" dan semua datanya?`)) {
        if (currentBook.id) {
          this.bookStateService.deleteBook(currentBook.id);
        }
      }
    }
    
    this.showMenu.set(false); // Selalu tutup menu setelah aksi
  }
}