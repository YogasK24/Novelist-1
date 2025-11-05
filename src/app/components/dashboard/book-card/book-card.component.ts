// src/app/components/dashboard/book-card/book-card.component.ts
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
  selector: 'app-book-card',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule, DecimalPipe, DropdownMenuComponent, IconComponent, ClickOutsideDirective, GeneratedCoverComponent],
  template: `
    @if (book(); as currentBook) {
      <div class="relative w-full" (clickOutside)="uiState.closeAllMenus()">
        <div
          (click)="handleCardClick($event, currentBook.id!)"
          class="card-fade-in group relative block rounded-lg shadow-md 
                transition-all duration-300 overflow-hidden h-full flex flex-col 
                border-2 hover:shadow-lg hover:-translate-y-1 hover:scale-105"
          
          [class.cursor-pointer]="!isSelectMode()"
          [class.cursor-default]="isSelectMode()"
          [class.scale-98]="isSelectMode() && !isSelected()"

          [class.border-accent-500]="isSelected()"
          [class.border-transparent]="!isSelected() && !isProcessing()"
          [class.border-accent-500/50]="isProcessing()"
          [class.shadow-xl]="isSelected()"
          [class.bg-accent-50]="isSelected()"
          [class.dark:bg-accent-900/20]="isSelected()"
          [class.bg-white]="!isSelected()"
          [class.dark:bg-gray-800/50]="!isSelected()"
        >
          
          @if (isSelectMode()) {
            <div class="absolute top-3 left-3 z-20 animate-fade-in">
              <input type="checkbox" 
                    [checked]="isSelected()"
                    (click)="$event.stopPropagation()" 
                    (change)="toggleSelect.emit(currentBook.id!)"
                    class="h-5 w-5 text-accent-600 rounded 
                          border-gray-400 dark:border-gray-500 
                          bg-white dark:bg-gray-700
                          focus:ring-accent-500 focus:ring-2 focus:ring-offset-0">
            </div>
          }

          @if (currentBook.isPinned && !isSelectMode()) {
            <div class="absolute top-2 right-2 z-10 text-accent-500 dark:text-accent-400" title="Pinned">
              <app-icon name="solid-pin-20" class="w-5 h-5"></app-icon>
            </div>
          }

          <!-- Wrapper for content that will be dimmed -->
          <div class="h-full w-full flex flex-col transition-opacity" [class.opacity-40]="isProcessing()">
            <!-- Background placeholder -->
            <div class="flex-grow bg-gray-200 dark:bg-gray-700/50 relative overflow-hidden">
              <app-generated-cover 
                [title]="currentBook.title" 
                [id]="currentBook.id!">
              </app-generated-cover>
              <div class="absolute top-0 right-0 h-full w-1.5 bg-accent-500"></div>
            </div>
            
            <!-- Content Wrapper -->
            <div class="relative flex-shrink-0 p-3"
                 [class.bg-accent-50]="isSelected()"
                 [class.dark:bg-accent-900/20]="isSelected()"
                 [class.bg-gray-50]="!isSelected()"
                 [class.dark:bg-gray-800]="!isSelected()">
              <div class="flex justify-between items-center gap-2">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">
                  {{ currentBook.title }}
                </h3>

                @if (!isSelectMode()) {
                  <div class="relative w-9 h-9 flex-shrink-0" [title]="'Daily Progress: ' + (currentBook.dailyProgressPercentage ?? 0) + '%'">
                      <svg class="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle class="text-gray-200 dark:text-gray-700/50"
                                  stroke-width="3"
                                  stroke="currentColor"
                                  fill="transparent"
                                  r="16" cx="18" cy="18" />
                          <circle [class]="progressColorClass()"
                                  stroke-width="3"
                                  [attr.stroke-dasharray]="circumference"
                                  [attr.stroke-dashoffset]="progressOffset()"
                                  stroke-linecap="round"
                                  stroke="currentColor"
                                  fill="transparent"
                                  r="16" cx="18" cy="18"
                                  class="transition-all duration-500 ease-in-out" />
                      </svg>
                      <button #menuTrigger (click)="handleToggleMenu($event, currentBook.id!)" data-menu-button="true"
                              [disabled]="isProcessing()"
                              aria-label="Opsi untuk novel {{ currentBook.title }}"
                              class="absolute inset-0 w-full h-full flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400
                                    hover:text-gray-900 dark:hover:text-white
                                    hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors z-20
                                    disabled:opacity-50 disabled:cursor-not-allowed">
                        <app-icon name="outline-kebab-vertical-24" class="w-5 h-5"></app-icon>
                      </button>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Spinner on top, without a dimming background -->
          @if (isProcessing()) {
            <div class="absolute inset-0 flex items-center justify-center z-30">
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
    'class': 'focus:outline-none block rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 dark:focus-visible:ring-offset-gray-900 aspect-[3/4]',
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
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .card-fade-in {
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
export class BookCardComponent {
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

  readonly circumference = 2 * Math.PI * 16;

  readonly progressOffset = computed(() => {
      const book = this.book();
      if (!book) return this.circumference;
      const percentage = book.dailyProgressPercentage ?? 0;
      return this.circumference - (percentage / 100) * this.circumference;
  });

  readonly progressColorClass = computed(() => {
      const percentage = this.book()?.dailyProgressPercentage ?? 0;
      if (percentage >= 90) {
        return 'text-green-500 dark:text-green-400';
      }
      if (percentage >= 50) {
        return 'text-orange-500 dark:text-orange-400';
      }
      return 'text-accent-500 dark:text-accent-400';
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
    this.wasLongPress = false;
    this.longPressTimer = setTimeout(() => this.triggerLongPress(), this.LONG_PRESS_DURATION);
    
    // Tambahkan listener untuk membatalkan long-press jika mouse bergerak.
    this.mouseMoveListener = () => this.clearLongPressTimer();
    document.addEventListener('mousemove', this.mouseMoveListener);
  }

  handleTouchStart(event: TouchEvent): void {
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
    if (target.closest('[data-menu-button]')) {
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