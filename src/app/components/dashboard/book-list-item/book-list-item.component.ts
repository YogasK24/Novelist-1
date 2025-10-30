// src/app/components/dashboard/book-list-item/book-list-item.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { IBook } from '../../../../types/data';
import { BookStateService } from '../../../state/book-state.service';
import { DropdownMenuComponent, type MenuItem } from '../../shared/dropdown-menu/dropdown-menu.component';

// Interface dari BookStateService (untuk type hint di input)
interface IBookWithStats extends IBook {
  chapterCount?: number;
  characterCount?: number;
  dailyProgressPercentage?: number;
}

@Component({
  selector: 'app-book-list-item',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, DecimalPipe, DropdownMenuComponent],
  template: `
    @if (book(); as currentBook) {
      <div
        (click)="onCardClick()"
        class="group relative flex items-center bg-white dark:bg-gray-800/50 rounded-lg shadow-lg 
              hover:shadow-xl dark:hover:bg-gray-800 hover:bg-gray-50 
              hover:-translate-y-1 transition-all duration-300 cursor-pointer
              border border-transparent hover:border-purple-300 dark:hover:border-purple-600">

        <div class="h-24 w-16 flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
               class="w-6 h-6 text-gray-400 dark:text-gray-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
          </svg>
          <div class="absolute top-0 right-0 h-full w-1 bg-purple-500"></div>
        </div>

        <div class="flex-grow p-4 min-w-0">
          <h3 class="flex items-center gap-2 text-md font-semibold text-gray-900 dark:text-gray-200 truncate
                     group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            @if (currentBook.isPinned) {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" title="Pinned">
                <path fill-rule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l.08.195a.82.82 0 00.445.445l.195.08c.772.321.772 1.415 0 1.736l-.195.08a.82.82 0 00-.445.445l-.08.195c-.321.772-1.415.772-1.736 0l-.08-.195a.82.82 0 00-.445-.445l-.195-.08c-.772-.321-.772-1.415 0-1.736l.195-.08a.82.82 0 00.445.445l.08-.195zM12.55 5.186a.75.75 0 10-1.06-1.06l.153-.153c.321-.321.842-.321 1.163 0l.153.153a.75.75 0 10-1.06 1.06l-.153-.153z" clip-rule="evenodd" />
                <path d="M5 6.25a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5A.75.75 0 015 6.25zm0 3.5A.75.75 0 015.75 9h3.5a.75.75 0 010 1.5h-3.5A.75.75 0 015 9.75zM5.155 12.805a.75.75 0 00.288 1.292l1.096.547a.75.75 0 00.547-1.096l-1.096-.547a.75.75 0 00-.835-.196zM4.6 15.395a.75.75 0 01-.288-1.292l1.096-.547a.75.75 0 01.547 1.096l-1.096.547a.75.75 0 01-.259.196z" />
                <path fill-rule="evenodd" d="M12.538 1.182a2.383 2.383 0 013.23.35l.153.153a2.383 2.383 0 01.35 3.23l-7.25 7.25a.75.75 0 11-1.06-1.06l7.25-7.25zM12.25 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
              </svg>
            }
            <span>{{ currentBook.title }}</span>
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
          <button #menuTrigger (click)="toggleMenu($event)" 
                  class="p-2 m-2 rounded-full 
                         text-gray-500 dark:text-gray-400 
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>
        </div>

        <!-- New Dropdown Menu Component -->
        <app-dropdown-menu 
            [isOpen]="showMenu()" 
            [items]="getMenuItems(currentBook)"
            [triggerElement]="menuTrigger"
            (close)="showMenu.set(false)"
            (itemClicked)="handleMenuAction($event)">
        </app-dropdown-menu>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListItemComponent {
  book = input<IBookWithStats | null>(null);
  editClicked = output<IBook>();
  setTargetClicked = output<IBook>();

  private readonly bookStateService = inject(BookStateService); 
  private readonly router = inject(Router);
  showMenu = signal(false);

  getMenuItems(currentBook: IBookWithStats): MenuItem[] {
    return [
      { label: currentBook.isPinned ? 'Unpin' : 'Pin', action: 'pin' },
      { label: currentBook.isArchived ? 'Unarchive' : 'Archive', action: 'archive' },
      { isSeparator: true },
      { label: 'Set Target', action: 'target' },
      { label: 'Edit Title', action: 'edit' },
      { isSeparator: true },
      { label: 'Delete Book', action: 'delete', isDanger: true },
    ];
  }

  onCardClick(): void {
    const currentBook = this.book();
    if (currentBook?.id) {
      this.router.navigate(['/book', currentBook.id]);
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showMenu.set(!this.showMenu());
  }

  handleMenuAction(action: string) {
    const currentBook = this.book();
    if (!currentBook || currentBook.id === undefined) return;

    switch(action) {
      case 'edit':
        this.editClicked.emit(currentBook as IBook);
        break;
      case 'target':
        this.setTargetClicked.emit(currentBook as IBook);
        break;
      case 'pin':
        this.bookStateService.pinBook(currentBook.id, !currentBook.isPinned);
        break;
      case 'archive':
        this.bookStateService.archiveBook(currentBook.id, !currentBook.isArchived);
        break;
      case 'delete':
        if (window.confirm(`Yakin ingin menghapus "${currentBook.title}" dan semua datanya?`)) {
            this.bookStateService.deleteBook(currentBook.id);
        }
        break;
    }
    
    this.showMenu.set(false);
  }
}