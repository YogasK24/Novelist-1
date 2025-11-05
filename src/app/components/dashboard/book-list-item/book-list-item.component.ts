// src/app/components/dashboard/book-list-item/book-list-item.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject, computed, ElementRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import type { IBook, IBookWithStats } from '../../../../types/data';
import { BookStateService } from '../../../state/book-state.service';
import { DropdownMenuComponent, type MenuItem } from '../../shared/dropdown-menu/dropdown-menu.component';
import { UiStateService } from '../../../state/ui-state.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmationService } from '../../../state/confirmation.service';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';
import { GeneratedCoverComponent } from '../../shared/generated-cover/generated-cover.component';

@Component({
  selector: 'app-book-list-item',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, DecimalPipe, DropdownMenuComponent, IconComponent, ClickOutsideDirective, GeneratedCoverComponent],
  template: `
    @if (book(); as currentBook) {
      <div class="relative w-full" (clickOutside)="uiState.closeAllMenus()">
        <div
          (click)="handleCardClick($event, currentBook.id!)"
          class="list-item-fade-in group relative rounded-lg shadow-lg 
                transition-all duration-300 
                border hover:shadow-xl dark:hover:bg-gray-800 hover:bg-gray-50 hover:scale-102"
          
          [class.cursor-pointer]="!isSelectMode()"
          [class.cursor-default]="isSelectMode()"
          [class.scale-98]="isSelectMode() && !isSelected()"

          [class.border-accent-500]="isSelected()"
          [class.border-transparent]="!isSelected()"
          [class.shadow-xl]="isSelected()"
          [class.bg-accent-50]="isSelected()"
          [class.dark:bg-accent-900/20]="isSelected()"
          [class.bg-white]="!isSelected()"
          [class.dark:bg-gray-800/50]="!isSelected()">

          <!-- Wrapper for content that will be dimmed -->
          <div class="flex items-center w-full transition-opacity" [class.opacity-40]="isProcessing()">
            
            @if (isSelectMode()) {
              <div class="flex-shrink-0 pl-4 animate-fade-in">
                <input type="checkbox" 
                      [checked]="isSelected()"
                      (click)="$event.stopPropagation()" 
                      (change)="toggleSelect.emit(currentBook.id!)"
                      class="h-5 w-5 text-accent-600 rounded 
                            border-gray-400 dark:border-gray-500 
                            bg-white dark:bg-gray-700
                            focus:ring-accent-500 focus:ring-2 focus:ring-offset-0">
              </div>
            } @else {
              @if (currentBook.isPinned) {
                <div cdkDragHandle 
                    (click)="$event.stopPropagation()"
                    class="flex-shrink-0 p-4 text-gray-500 dark:text-gray-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity rounded-l-lg hover:bg-gray-200 dark:hover:bg-gray-700 z-10"
                    title="Drag to reorder">
                    <app-icon name="solid-bars-3-20" class="w-5 h-5" />
                </div>
              }
            }

            <div class="h-24 w-16 flex-shrink-0 bg-gray-200 dark:bg-gray-700 relative overflow-hidden"
                 [class.rounded-l-lg]="!currentBook.isPinned || isSelectMode()">
              <app-generated-cover 
                [title]="currentBook.title" 
                [id]="currentBook.id!">
              </app-generated-cover>
              <div class="absolute top-0 right-0 h-full w-1 bg-accent-500"></div>
            </div>

            <div class="flex-grow p-4 min-w-0">
              <h3 class="flex items-center text-lg font-bold text-gray-900 dark:text-gray-200 truncate
                         group-hover:text-accent-600 dark:group-hover:text-accent-300 transition-colors">
                @if (currentBook.isPinned && !isSelectMode()) {
                  <app-icon name="solid-pin-20" 
                            class="text-accent-500 dark:text-accent-400 flex-shrink-0 mr-2"
                            title="Pinned"></app-icon>
                }
                <span>{{ currentBook.title }}</span>
              </h3>
              
              <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Total {{ currentBook.wordCount | number }} kata
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Diubah: {{ currentBook.lastModified | date:'short' }}
              </p>
            </div>
            
            <div class="flex-shrink-0 px-4 w-28 text-right">
               <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                <div class="h-1.5 rounded-full transition-colors" 
                     [class]="progressBarColorClass()"
                     [style.width.%]="currentBook.dailyProgressPercentage ?? 0"></div>
              </div>
              <p class="text-xs text-accent-600 dark:text-accent-400 font-medium">
                {{ currentBook.dailyProgressPercentage ?? 0 }}% Daily
              </p>
            </div>
            
            @if (!isSelectMode()) {
              <div class="flex-shrink-0 relative opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                <button #menuTrigger (click)="handleToggleMenu($event, currentBook.id!)" data-menu-button="true"
                        [disabled]="isProcessing()"
                        aria-label="Opsi untuk novel {{ currentBook.title }}"
                        class="p-2 m-2 rounded-full 
                              text-gray-500 dark:text-gray-400 
                              hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20
                              disabled:opacity-50 disabled:cursor-not-allowed">
                  <app-icon name="outline-kebab-vertical-24" class="w-5 h-5"></app-icon>
                </button>
              </div>
            } @else {
               <div class="w-12 flex-shrink-0"></div> <!-- Placeholder for menu button space -->
            }
          </div>

          <!-- Spinner on top, without a dimming background -->
          @if (isProcessing()) {
            <div class="absolute inset-0 flex items-center justify-center z-30 bg-white/30 dark:bg-gray-800/30">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
            </div>
          }
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
  host: {
    '[attr.tabindex]': "'-1'",
    'class': 'focus:outline-none block rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-900',
    '(mousedown)': 'handleMouseDown($event)',
    '(mouseup)': 'clearLongPressTimer()',
    '(mouseleave)': 'clearLongPressTimer()',
    '(touchstart)': 'handleTouchStart($event)',
    '(touchend)': 'clearLongPressTimer()',
    '(touchcancel)': 'clearLongPressTimer()',
    '(touchmove)': 'clearLongPressTimer()',
  },
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .list-item-fade-in {
      animation-name: fadeIn;
      animation-duration: 0.5s;
      animation-fill-mode: both;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListItemComponent {
  book = input<IBookWithStats | null>(null);
  
  // --- TAMBAHKAN INPUT & OUTPUT BARU ---
  isSelectMode = input(false);
  isSelected = input(false);
  toggleSelect = output<number>();
  
  editClicked = output<IBook>();
  setTargetClicked = output<IBook>();

  private readonly bookStateService = inject(BookStateService);
  private readonly router = inject(Router);
  readonly uiState = inject(UiStateService);
  private readonly confirmationService = inject(ConfirmationService);
  readonly elementRef = inject(ElementRef);
  
  private longPressTimer: any = null;
  private wasLongPress = false;
  private readonly LONG_PRESS_DURATION = 500; // ms
  private mouseMoveListener: (() => void) | null = null;

  readonly isProcessing = computed(() => this.bookStateService.processingBookId() === this.book()?.id);

  readonly progressBarColorClass = computed(() => {
    const percentage = this.book()?.dailyProgressPercentage ?? 0;
    if (percentage >= 90) {
      return 'bg-green-500 dark:bg-green-600';
    }
    if (percentage >= 50) {
      return 'bg-orange-500 dark:bg-orange-600';
    }
    return 'bg-accent-500 dark:bg-accent-600';
  });

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

  // --- NEW Methods for long press ---
  handleMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // Only for left-click
    
    // Jika mousedown pada drag handle, jangan lakukan apa-apa. Biarkan CDK Drag menanganinya.
    const target = event.target as HTMLElement;
    if (target.closest('[cdkDragHandle]')) {
      return;
    }

    this.wasLongPress = false;
    this.longPressTimer = setTimeout(() => this.triggerLongPress(), this.LONG_PRESS_DURATION);
    
    // Tambahkan listener untuk membatalkan long-press jika mouse bergerak.
    this.mouseMoveListener = () => this.clearLongPressTimer();
    document.addEventListener('mousemove', this.mouseMoveListener);
  }

  handleTouchStart(event: TouchEvent): void {
    // Jika sentuhan pada drag handle, jangan lakukan apa-apa.
    const target = event.target as HTMLElement;
    if (target.closest('[cdkDragHandle]')) {
      return;
    }

    this.wasLongPress = false;
    this.longPressTimer = setTimeout(() => this.triggerLongPress(), this.LONG_PRESS_DURATION);
  }

  clearLongPressTimer(): void {
    clearTimeout(this.longPressTimer);
    // Bersihkan listener mousemove untuk mencegah kebocoran memori.
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
      this.mouseMoveListener = null;
    }
  }

  private triggerLongPress(): void {
    this.wasLongPress = true;
    const currentBook = this.book();
    if (!currentBook || currentBook.id === undefined) return;
    
    // Enter select mode if not already in it
    if (!this.uiState.isSelectMode()) {
      this.uiState.enterSelectMode();
    }
    
    // Toggle selection for this item
    this.toggleSelect.emit(currentBook.id);
  }

  // --- MODIFIKASI FUNGSI KLIK UTAMA ---
  handleCardClick(event: MouseEvent, bookId: number): void {
    if (this.wasLongPress) {
      event.preventDefault();
      event.stopPropagation();
      this.wasLongPress = false;
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('[data-menu-button]') || target.closest('[cdkDragHandle]')) {
      return;
    }
    
    if (this.isSelectMode()) {
      this.toggleSelect.emit(bookId);
    } else {
      this.uiState.closeAllMenus();
      this.router.navigate(['/book', bookId]);
    }
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
  }
}