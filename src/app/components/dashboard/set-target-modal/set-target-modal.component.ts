import { Component, ChangeDetectionStrategy, inject, input, output, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookStateService } from '../../../state/book-state.service';
import type { IBook } from '../../../../types/data';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-set-target-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
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
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md ring-1 ring-black/5 dark:ring-white/10
               transform transition-all duration-300 ease-in-out"
        [class.opacity-100]="isShown()" [class.translate-y-0]="isShown()" [class.scale-100]="isShown()"
        [class.opacity-0]="!isShown()" [class.-translate-y-10]="!isShown()" [class.scale-95]="!isShown()"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
            Set Daily Word Target
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 rounded">
            <app-icon name="outline-x-mark-24" class="w-6 h-6"></app-icon>
          </button>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Set a daily writing goal for "{{ book()?.title }}". This helps track your progress.</p>

        <form [formGroup]="targetForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="dailyTarget" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Words per Day
            </label>
            <input
              type="number"
              id="dailyTarget"
              formControlName="target"
              class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500"
              placeholder="e.g., 500"
              min="0"
            />
             @if (targetForm.get('target')?.invalid && targetForm.get('target')?.touched) {
              <div class="text-red-400 text-sm mt-1">
               Please enter a valid number (0 or more).
             </div>
            }
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-md font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="targetForm.invalid || isLoading()"
              class="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
            >
              {{ isLoading() ? 'Menyimpan...' : 'Simpan Target' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetTargetModalComponent {
  book = input.required<IBook | null>();
  closeModal = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly bookState = inject(BookStateService);
  
  isLoading = signal(false);
  isShown = signal(false);

  targetForm = this.fb.group({
    target: [500, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    setTimeout(() => this.isShown.set(true), 10);

    effect(() => {
      const currentBook = this.book();
      if (currentBook) {
        this.targetForm.patchValue({ target: currentBook.dailyWordTarget });
      } else {
        this.targetForm.reset({ target: 500 });
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.targetForm.invalid || this.isLoading()) {
      this.targetForm.markAllAsTouched();
      return;
    }
    
    const target = this.targetForm.value.target!;
    const currentBook = this.book();

    this.isLoading.set(true);
    try {
      if (currentBook && currentBook.id) {
        await this.bookState.updateBookStats(currentBook.id, { dailyWordTarget: target });
      }
      this.close();
    } catch (e) {
      console.error("Failed to save target:", e);
      this.isLoading.set(false);
    }
  }
  
  close(): void {
    this.isShown.set(false);
    setTimeout(() => {
        this.closeModal.emit();
    }, 300);
  }
}