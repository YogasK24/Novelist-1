// src/app/components/dashboard/add-book-modal/add-book-modal.component.ts
import { Component, ChangeDetectionStrategy, inject, input, output, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookStateService } from '../../../state/book-state.service';
import type { IBook } from '../../../../types/data';

@Component({
  selector: 'app-add-book-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      (click)="closeModal.emit()" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-200">
            {{ isEditing() ? 'Edit Book Title' : 'Create a New Book' }}
          </h2>
          <button (click)="closeModal.emit()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="bookTitle" class="block text-sm font-medium text-gray-200 mb-1">
              Book Title
            </label>
            <input
              type="text"
              id="bookTitle"
              formControlName="title"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter the novel's title..."
            />
             @if (bookForm.get('title')?.invalid && bookForm.get('title')?.touched) {
              <div class="text-red-400 text-sm mt-1">
               Title is required.
             </div>
            }
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-gray-200 font-semibold transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="bookForm.invalid || isLoading()"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {{ isLoading() ? 'Menyimpan...' : (isEditing() ? 'Simpan Perubahan' : 'Buat Novel') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBookModalComponent {
  bookToEdit = input<IBook | null>();
  closeModal = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly bookState = inject(BookStateService);
  
  isEditing = signal(false);
  isLoading = signal(false);

  bookForm = this.fb.group({
    title: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      const book = this.bookToEdit();
      if (book) {
        this.isEditing.set(true);
        this.bookForm.patchValue({ title: book.title });
      } else {
        this.isEditing.set(false);
        this.bookForm.reset({ title: '' });
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.bookForm.invalid || this.isLoading()) {
      this.bookForm.markAllAsTouched();
      return;
    }
    
    const title = this.bookForm.value.title!;
    const book = this.bookToEdit();

    this.isLoading.set(true);
    try {
      if (book && book.id) {
        // Editing existing book
        await this.bookState.updateBookTitle(book.id, title);
      } else {
        // Adding new book
        await this.bookState.addNewBook(title);
      }
      this.closeModal.emit();
    } catch (e) {
      console.error("Failed to save book:", e);
    } finally {
      this.isLoading.set(false);
    }
  }
}
