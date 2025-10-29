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
        class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl dark:shadow-2xl dark:shadow-black/50 w-full max-w-md ring-1 ring-slate-200 dark:ring-white/10"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            {{ isEditing() ? 'Edit Book Title' : 'Create a New Book' }}
          </h2>
          <button (click)="closeModal.emit()" class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="bookTitle" class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              Book Title
            </label>
            <input
              type="text"
              id="bookTitle"
              formControlName="title"
              class="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500"
              placeholder="Enter the novel's title..."
            />
             @if (bookForm.get('title')?.invalid && bookForm.get('title')?.touched) {
              <div class="text-red-500 dark:text-red-400 text-sm mt-1">
               Title is required.
             </div>
            }
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-md text-slate-800 dark:text-slate-200 font-semibold transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="bookForm.invalid || isLoading()"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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