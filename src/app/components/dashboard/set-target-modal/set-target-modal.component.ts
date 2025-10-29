import { Component, ChangeDetectionStrategy, inject, input, output, effect } from '@angular/core';
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
      class="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
      (click)="closeModal.emit()" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md ring-1 ring-white/10"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-white">
            Set Daily Word Target
          </h2>
          <button (click)="closeModal.emit()" class="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <p class="text-sm text-gray-400 mb-4">Set a daily writing goal for "{{ book()?.title }}". This helps track your progress.</p>

        <form [formGroup]="targetForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="dailyTarget" class="block text-sm font-medium text-gray-300 mb-1">
              Words per Day
            </label>
            <input
              type="number"
              id="dailyTarget"
              formControlName="target"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              (click)="closeModal.emit()"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="targetForm.invalid"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Save Target
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
    if (this.targetForm.invalid) {
      this.targetForm.markAllAsTouched();
      return;
    }
    
    const target = this.targetForm.value.target!;
    const currentBook = this.book();

    if (currentBook && currentBook.id) {
      await this.bookState.updateBookStats(currentBook.id, { dailyWordTarget: target });
    }
    
    this.closeModal.emit();
  }
}
