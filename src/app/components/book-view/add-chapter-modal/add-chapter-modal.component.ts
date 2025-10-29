// src/app/components/book-view/add-chapter-modal/add-chapter-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import type { IChapter } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-add-chapter-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" aria-modal="true" role="dialog">
      <div 
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()">

        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-white">
            {{ chapterToEdit() ? 'Edit Judul Bab' : 'Buat Bab Baru' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <form [formGroup]="chapterForm" (ngSubmit)="onSubmit()">
          <div class="mb-6">
            <label for="chapterTitle" class="block text-sm font-medium text-gray-300 mb-1">
              Judul Bab
            </label>
            <input
              type="text"
              id="chapterTitle"
              formControlName="title"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Misal: Bab 1: Permulaan" 
              required
            />
            @if (chapterForm.controls['title'].invalid && (chapterForm.controls['title'].dirty || chapterForm.controls['title'].touched)) {
              <div class="text-red-400 text-xs mt-1"> Judul tidak boleh kosong. </div>
            }
          </div>

          <div class="flex justify-end space-x-3">
            <button type="button" (click)="close()"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition duration-150"> Batal </button>
            <button type="submit" [disabled]="chapterForm.invalid" 
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white disabled:opacity-50 transition duration-150"> Simpan </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddChapterModalComponent {
  show = input.required<boolean>();
  chapterToEdit = input<IChapter | null>(null);
  closeModal = output<void>();

  private fb = inject(FormBuilder);
  private bookState = inject(CurrentBookStateService); 

  chapterForm: FormGroup = this.fb.group({ 
      title: ['', Validators.required] 
  }); 

  constructor() {
    effect(() => {
      const chapter = this.chapterToEdit();
      const isVisible = this.show();
      if (chapter && isVisible) {
        this.chapterForm.patchValue({ title: chapter.title });
      } else {
        this.chapterForm.reset({ title: '' }); 
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.chapterForm.invalid) {
      this.chapterForm.markAllAsTouched(); 
      return;
    }

    const titleValue = this.chapterForm.value.title ?? '';
    const chapter = this.chapterToEdit();

    try {
      if (chapter && chapter.id != null) { 
        await this.bookState.updateChapterTitle(chapter.id, titleValue);
      } else {
        await this.bookState.addChapter(titleValue);
      }
      this.close(); 
    } catch (error) {
      console.error("Gagal menyimpan bab:", error);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
