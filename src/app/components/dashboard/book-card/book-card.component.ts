// src/app/components/dashboard/book-card/book-card.component.ts
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
  selector: 'app-book-card',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, DecimalPipe, DropdownMenuComponent],
  template: `
    @if (book(); as currentBook) {
      <div
        (click)="onCardClick()"
        class="group relative block bg-white dark:bg-gray-800/50 rounded-lg shadow-lg 
              hover:shadow-xl dark:hover:bg-gray-800 hover:bg-gray-50 
              hover:-translate-y-1 transition-all duration-300 
              overflow-hidden h-full flex flex-col cursor-pointer
              border border-transparent hover:border-purple-300 dark:hover:border-purple-600">
        
        @if (currentBook.isPinned) {
          <div class="absolute top-2 right-2 z-10 text-purple-500 dark:text-purple-400" title="Pinned">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l.08.195a.82.82 0 00.445.445l.195.08c.772.321.772 1.415 0 1.736l-.195.08a.82.82 0 00-.445.445l-.08.195c-.321.772-1.415.772-1.736 0l-.08-.195a.82.82 0 00-.445-.445l-.195-.08c-.772-.321-.772-1.415 0-1.736l.195-.08a.82.82 0 00.445.445l.08-.195zM12.55 5.186a.75.75 0 10-1.06-1.06l.153-.153c.321-.321.842-.321 1.163 0l.153.153a.75.75 0 10-1.06 1.06l-.153-.153z" clip-rule="evenodd" />
              <path d="M5 6.25a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5A.75.75 0 015 6.25zm0 3.5A.75.75 0 015.75 9h3.5a.75.75 0 010 1.5h-3.5A.75.75 0 015 9.75zM5.155 12.805a.75.75 0 00.288 1.292l1.096.547a.75.75 0 00.547-1.096l-1.096-.547a.75.75 0 00-.835-.196zM4.6 15.395a.75.75 0 01-.288-1.292l1.096-.547a.75.75 0 01.547 1.096l-1.096.547a.75.75 0 01-.259.196z" />
              <path fill-rule="evenodd" d="M12.538 1.182a2.383 2.383 0 013.23.35l.153.153a2.383 2.383 0 01.35 3.23l-7.25 7.25a.75.75 0 11-1.06-1.06l7.25-7.25zM12.25 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
            </svg>
          </div>
        }

        <div class="h-40 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
               class="w-12 h-12 text-gray-400 dark:text-gray-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
          </svg>
          
          <div class="absolute top-0 right-0 h-full w-1.5 bg-purple-500"></div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-800 flex justify-between items-center relative">
          <h3 class="text-md font-semibold text-gray-900 dark:text-gray-200 truncate pr-8">
            {{ currentBook.title }}
          </h3>
          
          <button #menuTrigger (click)="toggleMenu($event)" 
                  class="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full 
                         text-gray-500 dark:text-gray-400 
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20">
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
export class BookCardComponent {
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