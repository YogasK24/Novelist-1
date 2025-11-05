// src/app/components/dashboard/add-book-modal/add-book-modal.component.ts
import { Component, ChangeDetectionStrategy, inject, input, output, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookStateService } from '../../../state/book-state.service';
import type { IBook } from '../../../../types/data';
import { IconComponent } from '../../shared/icon/icon.component';
import { FocusTrapDirective } from '../../../directives/focus-trap.directive';

@Component({
  selector: 'app-add-book-modal',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, FocusTrapDirective],
  template: `
    <div 
      class="fixed inset-0 bg-black/70 flex justify-center items-center z-50 
             transition-opacity duration-300"
      [class.opacity-100]="isShown()"
      [class.opacity-0]="!isShown()"
      [class.pointer-events-none]="!isShown()"
      (click)="close()" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        appFocusTrap
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md ring-1 ring-black/5 dark:ring-white/10
               transform transition-all duration-300 ease-in-out"
        [class.opacity-100]="isShown()" [class.translate-y-0]="isShown()" [class.scale-100]="isShown()"
        [class.opacity-0]="!isShown()" [class.-translate-y-10]="!isShown()" [class.scale-95]="!isShown()"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
            {{ isEditing() ? 'Edit Judul Novel' : 'Buat Novel Baru' }}
          </h2>
          <button (click)="close()" aria-label="Tutup modal" class="text-gray-400 hover:text-gray-200 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 rounded">
            <app-icon name="outline-x-mark-24" class="w-6 h-6" />
          </button>
        </div>

        <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="bookTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Novel
            </label>
            <input
              type="text"
              id="bookTitle"
              formControlName="title"
              class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500"
              placeholder="Masukkan judul novel..."
            />
             @if (bookForm.get('title')?.invalid && bookForm.get('title')?.touched) {
              <div class="text-red-400 text-sm mt-1">
               Judul harus diisi.
             </div>
            }
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-md font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            >
              Batal
            </button>
            <button
              type="submit"
              [disabled]="bookForm.invalid || isLoading()"
              class="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
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
  isShown = signal(false);

  bookForm = this.fb.group({
    title: ['', Validators.required]
  });

  constructor() {
    // Memberi sedikit waktu sebelum transisi dimulai agar bisa berjalan
    setTimeout(() => this.isShown.set(true), 10);

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
      let success = false;
      if (book && book.id) {
        success = await this.bookState.updateBookTitle(book.id, title);
      } else {
        success = await this.bookState.addNewBook(title);
      }
      
      if (success) {
        this.close();
      }
    } catch (e) {
      console.error("Failed to save book:", e);
    } finally {
       this.isLoading.set(false);
    }
  }

  close(): void {
    this.isShown.set(false);
    // Tunggu animasi selesai sebelum emit event penutupan
    setTimeout(() => {
        this.closeModal.emit();
    }, 300);
  }
}
