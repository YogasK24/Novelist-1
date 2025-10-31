// src/app/components/dashboard/book-list-item/book-list-item.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { IBook, IBookWithStats } from '../../../../types/data';
import { BookStateService } from '../../../state/book-state.service';
import { DropdownMenuComponent, type MenuItem } from '../../shared/dropdown-menu/dropdown-menu.component';
import { UiStateService } from '../../../state/ui-state.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmationService } from '../../../state/confirmation.service';

@Component({
  selector: 'app-book-list-item',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, DecimalPipe, DropdownMenuComponent, IconComponent],
  template: `
    @if (book(); as currentBook) {
      <div
        (click)="handleCardClick(currentBook.id!)"
        class="group relative flex items-center bg-white dark:bg-gray-800/50 rounded-lg shadow-lg 
              hover:shadow-xl dark:hover:bg-gray-800 hover:bg-gray-50 
              transition-all duration-300 cursor-pointer
              border border-transparent hover:border-accent-300 dark:hover:border-accent-600">

        <div class="h-24 w-16 flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative rounded-l-lg">
          <app-icon name="outline-book-placeholder-24" class="w-6 h-6 text-gray-400 dark:text-gray-500"></app-icon>
          <div class="absolute top-0 right-0 h-full w-1 bg-accent-500"></div>
        </div>

        <div class="flex-grow p-4 min-w-0">
          <h3 class="flex items-center gap-2 text-md font-semibold text-gray-900 dark:text-gray-200 truncate
                     group-hover:text-accent-600 dark:group-hover:text-accent-300 transition-colors">
            @if (currentBook.isPinned) {
              <app-icon name="solid-pin-20" class="w-4 h-4 text-accent-500 dark:text-accent-400 flex-shrink-0" title="Pinned"></app-icon>
            }
            <span>{{ currentBook.title }}</span>
          </h3>
          
          <div class="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
             <div class="flex items-center" title="Total Words">
               <app-icon name="solid-document-text-20" class="w-4 h-4 mr-1 text-gray-400"></app-icon>
               <span>{{ currentBook.wordCount | number }}</span>
             </div>
             <div class="flex items-center" title="Total Chapters">
               <app-icon name="solid-book-open-20" class="w-4 h-4 mr-1 text-gray-400"></app-icon>
               <span>{{ currentBook.chapterCount ?? 0 }}</span>
             </div>
             <div class="flex items-center" title="Total Characters">
               <app-icon name="solid-users-20" class="w-4 h-4 mr-1 text-gray-400"></app-icon>
               <span>{{ currentBook.characterCount ?? 0 }}</span>
             </div>
          </div>
        </div>
        
        <div class="flex-shrink-0 px-4 w-28 text-right">
           <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
            <div class="bg-accent-500 dark:bg-accent-600 h-1.5 rounded-full" 
                 [style.width.%]="currentBook.dailyProgressPercentage ?? 0"></div>
          </div>
          <p class="text-xs text-accent-600 dark:text-accent-400 font-medium">
            {{ currentBook.dailyProgressPercentage ?? 0 }}% Daily
          </p>
        </div>

        <div class="flex-shrink-0 relative">
          <button #menuTrigger (click)="handleToggleMenu($event, currentBook.id!)" 
                  class="p-2 m-2 rounded-full 
                         text-gray-500 dark:text-gray-400 
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20 relative">
            <app-icon name="outline-kebab-vertical-24" class="w-5 h-5"></app-icon>
          </button>
        </div>

        <app-dropdown-menu 
            [isOpen]="uiState.activeMenuId() === currentBook.id" 
            [items]="getMenuItems(currentBook)"
            [triggerElement]="menuTrigger"
            (close)="uiState.closeAllMenus()"
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
  readonly uiState = inject(UiStateService);
  private readonly confirmationService = inject(ConfirmationService);

  getMenuItems(currentBook: IBookWithStats): MenuItem[] {
    return [
      { label: currentBook.isPinned ? 'Unpin' : 'Pin', action: 'pin', icon: 'solid-pin-20' },
      { label: currentBook.isArchived ? 'Unarchive' : 'Archive', action: 'archive', icon: 'outline-archive-box-24' },
      { isSeparator: true },
      { label: 'Set Target', action: 'target', icon: 'solid-viewfinder-circle-20' },
      { label: 'Edit Title', action: 'edit', icon: 'solid-pencil-20' },
      { isSeparator: true },
      { label: 'Delete Book', action: 'delete', isDanger: true, icon: 'solid-trash-20' },
    ];
  }

  handleCardClick(bookId: number): void {
    this.uiState.closeAllMenus();
    this.router.navigate(['/book', bookId]);
  }

  handleToggleMenu(event: MouseEvent, bookId: number): void {
    event.stopPropagation();
    this.uiState.toggleMenu(bookId);
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
        this.confirmationService.requestConfirmation({
          message: `Yakin ingin menghapus "${currentBook.title}" dan semua datanya? Tindakan ini tidak dapat diurungkan.`,
          onConfirm: () => {
            if (currentBook.id !== undefined) {
              this.bookStateService.deleteBook(currentBook.id);
            }
          }
        });
        break;
    }
    
    // The dropdown's close event will handle closing the menu
  }
}