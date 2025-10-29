import { Component, ChangeDetectionStrategy, inject, input, output, effect, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookStateService } from '../../../state/book-state.service';
import type { IBook } from '../../../../types/data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-set-target-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
            Set Daily Word Target
          </h2>
          <button (click)="closeModal.emit()" class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Set a daily writing goal for "{{ book()?.title }}". This helps track your progress.</p>

        <form [formGroup]="targetForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="dailyTarget" class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              Words per Day
            </label>
            <input
              type="number"
              id="dailyTarget"
              formControlName="target"
              class="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500"
              placeholder="e.g., 500"
              min="0"
            />
             @if (targetForm.get('target')?.invalid && targetForm.get('target')?.touched) {
              <div class="text-red-500 dark:text-red-400 text-sm mt-1">
               Please enter a valid number (0 or more).
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
              [disabled]="targetForm.invalid || isLoading()"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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

  targetForm = this.fb.group({
    target: [500, [Validators.required, Validators.min(0)]]
  });

  constructor() {
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
      this.closeModal.emit();
    } catch (e) {
      console.error("Failed to save target:", e);
    } finally {
      this.isLoading.set(false);
    }
  }
}