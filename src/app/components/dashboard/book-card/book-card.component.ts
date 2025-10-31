// src/app/components/dashboard/book-card/book-card.component.ts
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
  selector: 'app-book-card',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, DecimalPipe, DropdownMenuComponent, IconComponent],
  template: `
    @if (book(); as currentBook) {
      <div
        (click)="handleCardClick(currentBook.id!)"
        class="group relative block bg-white dark:bg-gray-800/50 rounded-lg shadow-lg 
              hover:shadow-xl dark:hover:bg-gray-800 hover:bg-gray-50 
              transition-all duration-300 
              overflow-hidden h-full flex flex-col cursor-pointer
              border border-transparent hover:border-accent-300 dark:hover:border-accent-600">
        
        @if (currentBook.isPinned) {
          <div class="absolute top-2 right-2 z-10 text-accent-500 dark:text-accent-400" title="Pinned">
            <app-icon name="solid-pin-20" class="w-5 h-5" />
          </div>
        }

        <div class="h-40 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
          <app-icon name="outline-book-placeholder-24" class="w-12 h-12 text-gray-400 dark:text-gray-500"></app-icon>
          
          <div class="absolute top-0 right-0 h-full w-1.5 bg-accent-500"></div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-800 flex justify-between items-center relative">
          <h3 class="text-md font-semibold text-gray-900 dark:text-gray-200 truncate pr-8">
            {{ currentBook.title }}
          </h3>
          
          <button #menuTrigger (click)="handleToggleMenu($event, currentBook.id!)" 
                  class="absolute top-1/2 right-2 -translate-y-1/2 p-2 rounded-full 
                         text-gray-500 dark:text-gray-400 
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20">
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
export class BookCardComponent {
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