// src/app/components/book-view/add-theme-modal/add-theme-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import type { ITheme } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-add-theme-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()"
      [class.opacity-0]="!show()"
      [class.pointer-events-none]="!show()"
      (click)="close()" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ themeToEdit() ? 'Edit Tema' : 'Tambah Tema Baru' }}
          </h2>
          <button (click)="close()" class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <form [formGroup]="themeForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="themeName" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Nama Tema
            </label>
            <input
              type="text"
              id="themeName"
              formControlName="name" 
              class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Misal: Keberanian, Pengkhianatan..."
              required
            />
            @if (themeForm.controls['name'].invalid && (themeForm.controls['name'].dirty || themeForm.controls['name'].touched)) {
              <div class="text-red-500 dark:text-red-400 text-xs mt-1"> Nama tidak boleh kosong. </div>
            }
          </div>

          <div class="mb-6">
             <label for="themeDesc" class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
               Deskripsi Singkat (Opsional)
             </label>
             <textarea
               id="themeDesc"
               formControlName="description" 
               rows="3"
               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
               placeholder="Jelaskan bagaimana tema ini muncul dalam cerita..."
             ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md text-gray-800 dark:text-white transition duration-150"
            >
              Batal
            </button>
            <button
              type="submit"
              [disabled]="themeForm.invalid || isLoading()" 
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white disabled:opacity-50 transition duration-150"
            >
              {{ isLoading() ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddThemeModalComponent {
  show = input.required<boolean>();
  themeToEdit = input<ITheme | null>(null);
  closeModal = output<void>();

  private fb = inject(FormBuilder);
  private bookState = inject(CurrentBookStateService); 

  isLoading = signal(false);

  themeForm = this.fb.group({
    name: ['', Validators.required],
    description: [''] 
  });

  constructor() {
    effect(() => {
      const theme = this.themeToEdit();
      const isVisible = this.show();

      if (theme && isVisible) {
        this.themeForm.patchValue({
          name: theme.name,
          description: theme.description
        });
      } else {
        this.themeForm.reset({ name: '', description: '' });
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.themeForm.invalid || this.isLoading()) {
      this.themeForm.markAllAsTouched();
      return;
    }

    const { name, description } = this.themeForm.value;
    const theme = this.themeToEdit();

    this.isLoading.set(true);
    try {
      if (theme && theme.id) {
        await this.bookState.updateTheme(theme.id, { name: name!, description: description! });
      } else {
        await this.bookState.addTheme(name!, description!);
      }
      this.close();
    } catch (error) {
      console.error("Gagal menyimpan tema:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
