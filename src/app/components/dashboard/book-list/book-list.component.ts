// src/app/components/dashboard/book-list/book-list.component.ts
import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { BookStateService } from '../../../state/book-state.service';
import type { IBook } from '../../../../types/data';
import { BookCardComponent } from '../book-card/book-card.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [BookCardComponent],
  template: `
    <div class="mb-6 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white">Your Books</h1>
    </div>

    @if (bookState.isLoading()) {
      <div class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 dark:border-purple-400"></div>
      </div>
    } @else if (bookState.books(); as books) {
        @if (books.length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            @for (book of books; track book.id) {
              <app-book-card 
                [book]="book"
                (editClicked)="handleEditClicked($event)"
                (setTargetClicked)="handleSetTargetClicked($event)">
              </app-book-card>
            }
          </div>
        } @else {
          <div class="text-center py-16 px-6 bg-white dark:bg-slate-800/50 ring-1 ring-slate-200 dark:ring-white/10 rounded-lg">
            <h2 class="text-xl font-semibold text-slate-800 dark:text-white">No Books Found</h2>
            <p class="text-slate-500 dark:text-slate-400 mt-2">Click the '+' button to start your first novel.</p>
          </div>
        }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent {
  readonly bookState = inject(BookStateService);
  editClicked = output<IBook>();
  setTargetClicked = output<IBook>();

  handleEditClicked(book: IBook): void {
    this.editClicked.emit(book);
  }
  
  handleSetTargetClicked(book: IBook): void {
    this.setTargetClicked.emit(book);
  }
}