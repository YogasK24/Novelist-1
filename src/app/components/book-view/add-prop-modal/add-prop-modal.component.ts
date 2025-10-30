// src/app/components/book-view/add-prop-modal/add-prop-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import type { IProp } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-add-prop-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
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
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
            {{ propToEdit() ? 'Edit Properti' : 'Tambah Properti Baru' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-purple-500 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form [formGroup]="propForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="propName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Properti/Item
            </label>
            <input
              type="text"
              id="propName"
              formControlName="name" 
              class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 
                     focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
              placeholder="Misal: Pedang Legendaris, Surat Wasiat..."
              required
            />
            @if (propForm.controls['name'].invalid && (propForm.controls['name'].dirty || propForm.controls['name'].touched)) {
              <div class="text-red-400 text-xs mt-1"> Nama tidak boleh kosong. </div>
            }
          </div>

          <div class="mb-6">
             <label for="propDesc" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
               Deskripsi Singkat (Opsional)
             </label>
             <textarea
               id="propDesc"
               formControlName="description" 
               rows="3"
               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                      text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 
                      focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
               placeholder="Deskripsi, fungsi, atau catatan penting..."
             ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 
                     text-gray-800 dark:text-gray-200 rounded-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500"
            >
              Batal
            </button>
            <button
              type="submit"
              [disabled]="propForm.invalid || isLoading()" 
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md 
                     disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
export class AddPropModalComponent {
  show = input.required<boolean>();
  propToEdit = input<IProp | null>(null);
  closeModal = output<void>();

  private fb = inject(FormBuilder);
  private bookState = inject(CurrentBookStateService); 

  isLoading = signal(false);

  propForm = this.fb.group({
    name: ['', Validators.required],
    description: [''] 
  });

  constructor() {
    effect(() => {
      const prop = this.propToEdit();
      const isVisible = this.show();

      if (prop && isVisible) {
        this.propForm.patchValue({
          name: prop.name,
          description: prop.description
        });
      } else {
        this.propForm.reset({ name: '', description: '' });
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.propForm.invalid || this.isLoading()) {
      this.propForm.markAllAsTouched();
      return;
    }

    const { name, description } = this.propForm.value;
    const prop = this.propToEdit();

    this.isLoading.set(true);
    try {
      if (prop && prop.id) {
        await this.bookState.updateProp(prop.id, { name: name!, description: description! });
      } else {
        await this.bookState.addProp(name!, description!);
      }
      this.close();
    } catch (error) {
      console.error("Gagal menyimpan properti:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}