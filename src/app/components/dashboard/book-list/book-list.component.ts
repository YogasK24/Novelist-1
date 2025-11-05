// src/app/components/dashboard/book-list/book-list.component.ts
import { Component, ChangeDetectionStrategy, inject, output, input, signal, ViewChildren, QueryList, ElementRef, effect, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookStateService, type ViewMode } from '../../../state/book-state.service';
import type { IBook, IBookWithStats } from '../../../../types/data';
import { BookCardComponent } from '../book-card/book-card.component';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { CommonModule } from '@angular/common';
import { BookListSkeletonComponent } from '../book-list-skeleton/book-list-skeleton.component';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, BookCardComponent, BookListItemComponent, IconComponent, BookListSkeletonComponent, DragDropModule],
  template: `
    @if (bookState.isLoading()) {
      <app-book-list-skeleton [viewMode]="viewMode()"></app-book-list-skeleton>
    } @else if (bookState.sortedBooks(); as books) {
        @if (books.length > 0) {
          @if (viewMode() === 'grid') {
            <div #listContainer class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]"
                 tabindex="0" (focus)="initFocus()" (blur)="activeIndex.set(null)" (keydown)="handleKeydown($event)">
              
              <!-- Pinned and Draggable Books -->
              <div cdkDropList 
                   [cdkDropListData]="bookState.pinnedBooks()"
                   (cdkDropListDropped)="onDrop($event)"
                   [cdkDropListDisabled]="true"
                   class="contents">
                @for (book of bookState.pinnedBooks(); track book.id; let i = $index) {
                  <app-book-card 
                    cdkDrag
                    [cdkDragData]="book"
                    [cdkDragDisabled]="true"
                    [book]="book"
                    [isSelectMode]="isSelectMode()"
                    [isSelected]="selectedIds().has(book.id!)"
                    (toggleSelect)="toggleSelect.emit($event)"
                    [style.animation-delay]="i * 50 + 'ms'"
                    (editClicked)="handleEditClicked($event)"
                    (setTargetClicked)="handleSetTargetClicked($event)">
                  </app-book-card>
                }
              </div>
              
              <!-- Unpinned Books -->
              @for (book of bookState.unpinnedBooks(); track book.id; let i = $index) {
                <app-book-card 
                  [book]="book"
                  [isSelectMode]="isSelectMode()"
                  [isSelected]="selectedIds().has(book.id!)"
                  (toggleSelect)="toggleSelect.emit($event)"
                  [style.animation-delay]="(i + bookState.pinnedBooks().length) * 50 + 'ms'"
                  (editClicked)="handleEditClicked($event)"
                  (setTargetClicked)="handleSetTargetClicked($event)">
                </app-book-card>
              }
            </div>
          } @else {
            <div #listContainer class="space-y-4"
                 tabindex="0" (focus)="initFocus()" (blur)="activeIndex.set(null)" (keydown)="handleKeydown($event)">
              
              <!-- Pinned and Draggable Books -->
              <div cdkDropList 
                   [cdkDropListData]="bookState.pinnedBooks()"
                   (cdkDropListDropped)="onDrop($event)"
                   [cdkDropListDisabled]="false"
                   class="space-y-4 pinned-drop-zone rounded-lg">
                @for (book of bookState.pinnedBooks(); track book.id; let i = $index) {
                  <app-book-list-item
                    cdkDrag
                    [cdkDragData]="book"
                    [cdkDragDisabled]="false"
                    [book]="book"
                    [isSelectMode]="isSelectMode()"
                    [isSelected]="selectedIds().has(book.id!)"
                    (toggleSelect)="toggleSelect.emit($event)"
                    [style.animation-delay]="i * 50 + 'ms'"
                    (editClicked)="handleEditClicked($event)"
                    (setTargetClicked)="handleSetTargetClicked($event)">
                  </app-book-list-item>
                }
              </div>

              <!-- Unpinned Books -->
              @for (book of bookState.unpinnedBooks(); track book.id; let i = $index) {
                <app-book-list-item
                  [book]="book"
                  [isSelectMode]="isSelectMode()"
                  [isSelected]="selectedIds().has(book.id!)"
                  (toggleSelect)="toggleSelect.emit($event)"
                  [style.animation-delay]="(i + bookState.pinnedBooks().length) * 50 + 'ms'"
                  (editClicked)="handleEditClicked($event)"
                  (setTargetClicked)="handleSetTargetClicked($event)">
                </app-book-list-item>
              }
            </div>
          }
        } @else {
          @if (bookState.books().length > 0) {
            <div class="text-center py-20 px-6">
              <app-icon name="outline-funnel-24" class="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600"></app-icon>
              <h2 class="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Tidak Ada Hasil</h2>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Tidak ada novel yang cocok dengan filter Anda saat ini.</p>
              <button (click)="bookState.showAllBooks()" 
                      class="mt-6 inline-flex items-center px-6 py-3 border border-transparent 
                             text-base font-medium rounded-md shadow-sm text-white 
                             bg-accent-600 hover:bg-accent-700 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500
                             dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-105">
                Tampilkan Semua Novel
              </button>
            </div>
          } @else {
            <div class="text-center py-20 px-6">
              <app-icon name="outline-writing-placeholder-24" class="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600"></app-icon>
              <h2 class="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Novel hebat pertamamu menanti.</h2>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Mulai petualanganmu dengan membuat novel pertamamu.</p>
              <button (click)="createFirstBookClicked.emit()" 
                      class="mt-6 inline-flex items-center px-6 py-3 border border-transparent 
                             text-base font-medium rounded-md shadow-sm text-white 
                             bg-accent-600 hover:bg-accent-700 
                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500
                             dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-105">
                Buat Novel Pertamamu
              </button>
            </div>
          }
        }
    }
  `,
  styles: [`
    /* --- ENHANCED DRAG & DROP STYLES --- */

    /* The user-visible preview of the item being dragged */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
      /* Add a subtle scaling effect to lift it off the page */
      transform: scale(1.02);
    }
    
    /* The placeholder for the item in its original list */
    .cdk-drag-placeholder {
      /* Make the original item semi-transparent instead of fully transparent */
      opacity: 0.4 !important;
      transition: opacity 150ms ease-in-out;
    }
    
    /* Animation while the item is returning to its start position */
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    /* Make other items in the list move smoothly when an item is dragged over them */
    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    /* Highlight the drop zone when an item is being dragged over it */
    .pinned-drop-zone {
      /* Add padding for the border to appear inside, and use negative margin to keep layout */
      padding: 0.5rem;
      margin: -0.5rem;
      border: 2px dashed transparent; /* Reserve space for border to prevent layout shift */
      transition: background-color 250ms ease, border-color 250ms ease, box-shadow 250ms ease;
    }

    .pinned-drop-zone.cdk-drag-over {
      background-color: var(--accent-100);
      border-color: var(--accent-400);
      box-shadow: inset 0 0 8px rgba(var(--accent-500-rgb), 0.2);
    }
    
    :host-context(.dark) .pinned-drop-zone.cdk-drag-over {
      background-color: rgba(var(--accent-500-rgb), 0.15);
      border-color: var(--accent-600);
      box-shadow: inset 0 0 12px rgba(var(--accent-500-rgb), 0.3);
    }

    /* Styling for FLIP animation */
    :host ::ng-deep .animating-reorder {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent implements AfterViewInit {
  readonly bookState = inject(BookStateService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  
  viewMode = input.required<ViewMode>();
  editClicked = output<IBook>();
  setTargetClicked = output<IBook>();
  createFirstBookClicked = output<void>();

  // --- 2. TAMBAHKAN INPUT & OUTPUT BARU ---
  isSelectMode = input(false);
  selectedIds = input<Set<number>>(new Set());
  toggleSelect = output<number>();

  @ViewChildren(BookCardComponent) cardItems!: QueryList<BookCardComponent>;
  @ViewChildren(BookListItemComponent) listItems!: QueryList<BookListItemComponent>;
  @ViewChildren('listContainer') listContainer!: QueryList<ElementRef>;
  
  activeIndex = signal<number | null>(null);

  // --- NEW: For FLIP Animation ---
  private previousPositions = new Map<number, DOMRect>();
  private isFirstLoad = true;
  private reorderEffect = effect(() => {
    // Watch for changes in the sorted books list
    const books = this.bookState.sortedBooks();
    const view = this.viewMode();
    
    // Defer execution to after the view has been checked, to ensure QueryLists are updated
    Promise.resolve().then(() => this.runFlipAnimation());
  });

  constructor() {
    // Effect to apply focus when activeIndex changes
    effect(() => {
      const index = this.activeIndex();
      if (index !== null) {
        const elements = this.viewMode() === 'grid' ? this.cardItems.map(c => c['elementRef']) : this.listItems.map(c => c['elementRef']);
        Promise.resolve().then(() => {
          elements?.at(index)?.nativeElement.focus();
        });
      }
    });
    
    // Effect to gracefully handle data changes (e.g., deletion)
    effect(() => {
        const books = this.bookState.sortedBooks();
        const currentIndex = this.activeIndex();

        if (currentIndex !== null && currentIndex >= books.length) {
            this.activeIndex.set(books.length > 0 ? books.length - 1 : null);
        }
    });
  }

  ngAfterViewInit(): void {
    // Memastikan QueryList diperbarui saat viewMode berubah
    this.cardItems.changes.subscribe(() => this.capturePositions());
    this.listItems.changes.subscribe(() => this.capturePositions());
    // Initial position capture
    setTimeout(() => this.capturePositions(), 0);
  }

  // --- FLIP ANIMATION LOGIC ---
  private capturePositions() {
    const items = this.viewMode() === 'grid' ? this.cardItems : this.listItems;
    const newPositions = new Map<number, DOMRect>();
    items.forEach(item => {
      const book = item.book();
      if (book?.id !== undefined) {
        newPositions.set(book.id, item['elementRef'].nativeElement.getBoundingClientRect());
      }
    });
    this.previousPositions = newPositions;
  }

  private runFlipAnimation() {
    if (this.isFirstLoad) {
      this.isFirstLoad = false;
      this.capturePositions();
      return;
    }

    const items = this.viewMode() === 'grid' ? this.cardItems : this.listItems;
    items.forEach(item => {
      const book = item.book();
      if (book?.id === undefined) return;
      
      const el = item['elementRef'].nativeElement;
      const newRect = el.getBoundingClientRect();
      const oldRect = this.previousPositions.get(book.id);

      if (oldRect) {
        const deltaX = oldRect.left - newRect.left;
        const deltaY = oldRect.top - newRect.top;

        if (deltaX !== 0 || deltaY !== 0) {
          el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          el.style.transition = 'transform 0s';

          requestAnimationFrame(() => {
            el.classList.add('animating-reorder');
            el.style.transform = '';
          });

          el.addEventListener('transitionend', () => {
            el.classList.remove('animating-reorder');
          }, { once: true });
        }
      }
    });
    this.capturePositions();
  }
  // --- END FLIP ANIMATION ---

  onDrop(event: CdkDragDrop<IBookWithStats[]>): void {
    this.bookState.reorderPinnedBooks(event);
  }
  
  initFocus(): void {
    if (this.activeIndex() === null && this.bookState.sortedBooks().length > 0) {
      this.activeIndex.set(0);
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    const items = this.bookState.sortedBooks();
    if (items.length === 0 || this.activeIndex() === null) return;
    
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Enter'].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    let currentIndex = this.activeIndex()!;
    const totalItems = items.length;
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (this.viewMode() === 'grid') {
          const cols = this.getGridColumnCount();
          nextIndex = Math.min(currentIndex + cols, totalItems - 1);
        } else {
          nextIndex = (currentIndex + 1) % totalItems;
        }
        break;
        
      case 'ArrowUp':
        if (this.viewMode() === 'grid') {
          const cols = this.getGridColumnCount();
          nextIndex = Math.max(currentIndex - cols, 0);
        } else {
          nextIndex = (currentIndex - 1 + totalItems) % totalItems;
        }
        break;
        
      case 'ArrowRight':
        if (this.viewMode() === 'grid') {
          nextIndex = Math.min(currentIndex + 1, totalItems - 1);
        }
        break;
        
      case 'ArrowLeft':
        if (this.viewMode() === 'grid') {
          nextIndex = Math.max(currentIndex - 1, 0);
        }
        break;
        
      case 'Enter':
        const book = items[currentIndex];
        if (this.isSelectMode()) {
            if (book?.id) {
                this.toggleSelect.emit(book.id);
            }
        } else {
            if (book?.id) {
              this.router.navigate(['/book', book.id]);
            }
        }
        break;
    }
    
    if (nextIndex !== currentIndex) {
      this.activeIndex.set(nextIndex);
    }
  }

  private getGridColumnCount(): number {
    const containerEl = this.listContainer.first?.nativeElement;
    if (!containerEl) return 1;
    const columns = getComputedStyle(containerEl).getPropertyValue("grid-template-columns").split(" ").length;
    return columns || 1;
  }
  
  handleEditClicked(book: IBook): void {
    this.editClicked.emit(book);
  }
  
  handleSetTargetClicked(book: IBook): void {
    this.setTargetClicked.emit(book);
  }
}