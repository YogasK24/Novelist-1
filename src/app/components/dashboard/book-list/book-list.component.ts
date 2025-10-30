// src/app/components/dashboard/book-list/book-list.component.ts
import { Component, ChangeDetectionStrategy, inject, output, input } from '@angular/core';
import { BookStateService, type ViewMode } from '../../../state/book-state.service';
import type { IBook } from '../../../../types/data';
import { BookCardComponent } from '../book-card/book-card.component';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [BookCardComponent, BookListItemComponent],
  template: `
    <div class="mb-6 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-200">Your Books</h1>
    </div>

    @if (bookState.isLoading()) {
      <div class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 dark:border-purple-400"></div>
      </div>
    } @else if (bookState.sortedBooks(); as books) {
        @if (books.length > 0) {
          @if (viewMode() === 'grid') {
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              @for (book of books; track book.id) {
                <app-book-card 
                  [book]="book"
                  (editClicked)="handleEditClicked($event)"
                  (setTargetClicked)="handleSetTargetClicked($event)">
                </app-book-card>
              }
            </div>
          } @else {
            <div class="space-y-4">
              @for (book of books; track book.id) {
                <app-book-list-item
                  [book]="book"
                  (editClicked)="handleEditClicked($event)"
                  (setTargetClicked)="handleSetTargetClicked($event)">
                </app-book-list-item>
              }
            </div>
          }
        } @else {
          <div class="text-center py-20 px-6 bg-white dark:bg-gray-800/50 ring-1 ring-gray-300 dark:ring-white/10 rounded-lg">
            
            <svg class="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>

            <h2 class="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Novel hebat pertamamu menanti.</h2>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Mulai petualanganmu dengan menekan tombol '+' di pojok bawah.</p>
          </div>
        }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent {
  readonly bookState = inject(BookStateService);
  viewMode = input.required<ViewMode>();
  editClicked = output<IBook>();
  setTargetClicked = output<IBook>();

  handleEditClicked(book: IBook): void {
    this.editClicked.emit(book);
  }
  
  handleSetTargetClicked(book: IBook): void {
    this.setTargetClicked.emit(book);
  }
}
