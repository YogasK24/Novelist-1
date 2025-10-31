// src/app/components/dashboard/book-list/book-list.component.ts
import { Component, ChangeDetectionStrategy, inject, output, input } from '@angular/core';
import { BookStateService, type ViewMode } from '../../../state/book-state.service';
import type { IBook } from '../../../../types/data';
import { BookCardComponent } from '../book-card/book-card.component';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [BookCardComponent, BookListItemComponent, IconComponent],
  template: `
    @if (bookState.isLoading()) {
      <div class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600 dark:border-accent-400"></div>
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
          @if (bookState.books().length > 0 && !bookState.showArchived()) {
            <div class="text-center py-20 px-6">
              <app-icon name="outline-archive-box-24" class="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600"></app-icon>
              <h2 class="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Semua novel diarsipkan.</h2>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Anda dapat menampilkan novel yang diarsipkan dari menu opsi di header.</p>
            </div>
          } @else {
            <div class="text-center py-20 px-6">
              <app-icon name="outline-writing-placeholder-24" class="mx-auto h-20 w-20 text-gray-400 dark:text-gray-600"></app-icon>
              <h2 class="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-200">Novel hebat pertamamu menanti.</h2>
              <p class="text-gray-600 dark:text-gray-400 mt-2">Mulai petualanganmu dengan menekan tombol '+' di pojok bawah.</p>
            </div>
          }
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