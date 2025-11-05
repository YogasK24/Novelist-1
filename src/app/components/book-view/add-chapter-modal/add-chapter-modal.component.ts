// src/app/components/book-view/add-chapter-modal/add-chapter-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import type { IChapter } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { FocusTrapDirective } from '../../../directives/focus-trap.directive';

@Component({
  selector: 'app-add-chapter-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, FocusTrapDirective],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" aria-modal="true" role="dialog">
      <div 
        appFocusTrap
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()">

        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
            {{ chapterToEdit() ? 'Edit Chapter Title' : 'Create New Chapter' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-accent-500 rounded">
            <app-icon name="outline-x-mark-24" class="w-6 h-6" />
          </button>
        </div>

        <form [formGroup]="chapterForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="chapterTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chapter Title</label>
            <input
              type="text"
              id="chapterTitle"
              formControlName="title"
              class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 
                     focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500"
              placeholder="e.g., Chapter 1: The Beginning"
              required
            />
            @if (chapterForm.controls['title'].invalid && (chapterForm.controls['title'].dirty || chapterForm.controls['title'].touched)) {
              <div class="text-red-400 text-xs mt-1"> Title cannot be empty. </div>
            }
          </div>

          <div class="mb-6">
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Appearing Characters</label>
             <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-md max-h-32 overflow-y-auto">
               @for (char of bookState.characters(); track char.id) {
                 <div class="flex items-center mb-1">
                   <input type="checkbox" 
                     [id]="'chap-char-' + char.id" 
                     [checked]="characterIds.value.includes(char.id!)"
                     (change)="onCharacterCheck(char.id!, $event)"
                     class="h-4 w-4 text-accent-600 bg-gray-200 dark:bg-gray-900 border-gray-400 dark:border-gray-600 rounded 
                            focus:ring-accent-600 dark:focus:ring-accent-500">
                   <label [for]="'chap-char-' + char.id" class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ char.name }}</label>
                 </div>
               }
               @if (bookState.characters().length === 0) {
                  <p class="text-xs text-gray-500">Add Characters in the Characters tab first.</p>
               }
             </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button type="button" (click)="close()" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 
                                                        text-gray-800 dark:text-gray-200 rounded-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"> Cancel </button>
            <button type="submit" [disabled]="chapterForm.invalid || isLoading()" class="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md 
                                                                                   disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"> 
              {{ isLoading() ? 'Saving...' : 'Save' }} 
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
      console.error("Failed to save chapter:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
