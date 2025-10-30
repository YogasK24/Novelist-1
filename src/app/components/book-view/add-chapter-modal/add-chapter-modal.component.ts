// src/app/components/book-view/add-chapter-modal/add-chapter-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import type { IChapter } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-add-chapter-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" aria-modal="true" role="dialog">
      <div 
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()">

        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-200">
            {{ chapterToEdit() ? 'Edit Judul Bab' : 'Buat Bab Baru' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form [formGroup]="chapterForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="chapterTitle" class="block text-sm font-medium text-gray-200 mb-1">Judul Bab</label>
            <input
              type="text"
              id="chapterTitle"
              formControlName="title"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Misal: Bab 1: Permulaan"
              required
            />
            @if (chapterForm.controls['title'].invalid && (chapterForm.controls['title'].dirty || chapterForm.controls['title'].touched)) {
              <div class="text-red-400 text-xs mt-1"> Judul tidak boleh kosong. </div>
            }
          </div>

          <div class="mb-6">
             <label class="block text-sm font-medium text-gray-200 mb-2">Karakter yang Muncul</label>
             <div class="bg-gray-700 p-3 rounded-md max-h-32 overflow-y-auto">
               @for (char of bookState.characters(); track char.id) {
                 <div class="flex items-center mb-1">
                   <input type="checkbox" 
                     [id]="'chap-char-' + char.id" 
                     [checked]="characterIds.value.includes(char.id!)"
                     (change)="onCharacterCheck(char.id!, $event)"
                     class="h-4 w-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500">
                   <label [for]="'chap-char-' + char.id" class="ml-2 text-sm text-gray-300">{{ char.name }}</label>
                 </div>
               }
               @if (bookState.characters().length === 0) {
                  <p class="text-xs text-gray-500">Tambahkan Karakter di tab Karakter terlebih dahulu.</p>
               }
             </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button type="button" (click)="close()" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-gray-200 transition duration-150"> Batal </button>
            <button type="submit" [disabled]="chapterForm.invalid || isLoading()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white disabled:opacity-50 transition duration-150"> 
              {{ isLoading() ? 'Menyimpan...' : 'Simpan' }} 
            </button>
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
  public bookState = inject(CurrentBookStateService);
  isLoading = signal(false);

  chapterForm = this.fb.group({
    title: ['', Validators.required],
    characterIds: this.fb.array<FormControl<number>>([])
  });
  
  get characterIds(): FormArray<FormControl<number>> {
    return this.chapterForm.get('characterIds') as FormArray<FormControl<number>>;
  }

  constructor() {
    effect(() => {
      const chapter = this.chapterToEdit();
      const isVisible = this.show();

      if (chapter && isVisible) {
        this.chapterForm.patchValue({ title: chapter.title });
        this.setCharacterFormArray(chapter.characterIds);
      } else if (!chapter && isVisible) {
        this.chapterForm.reset({ title: '' });
        this.setCharacterFormArray([]);
      }
    });
  }

  private setCharacterFormArray(ids: number[]): void {
      const formArray = this.fb.array((ids || []).map(id => this.fb.control(id)));
      this.chapterForm.setControl('characterIds', formArray);
  }
  
  onCharacterCheck(id: number, event: Event): void {
      const isChecked = (event.target as HTMLInputElement).checked;
      const formArray = this.characterIds;
      const index = formArray.value.indexOf(id);

      if (isChecked && index === -1) {
          formArray.push(this.fb.control(id));
      } else if (!isChecked && index !== -1) {
          formArray.removeAt(index);
      }
  }

  async onSubmit(): Promise<void> {
    if (this.chapterForm.invalid || this.isLoading()) {
      this.chapterForm.markAllAsTouched();
      return;
    }

    const titleValue = this.chapterForm.value.title ?? '';
    const characterIds = this.characterIds.value as number[];
    const chapter = this.chapterToEdit();
    
    const uniqueCharacterIds = [...new Set(characterIds)].filter(id => id != null) as number[];

    this.isLoading.set(true);
    try {
      if (chapter && chapter.id != null) {
        await this.bookState.updateChapterTitle(chapter.id, titleValue, uniqueCharacterIds);
      } else {
        await this.bookState.addChapter(titleValue, uniqueCharacterIds);
      }
      this.close();
    } catch (error) {
      console.error("Gagal menyimpan bab:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
