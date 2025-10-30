// src/app/components/book-view/add-location-modal/add-location-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import type { ILocation } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-add-location-modal',
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
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-200">
            {{ locationToEdit() ? 'Edit Lokasi' : 'Tambah Lokasi Baru' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form [formGroup]="locationForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="locName" class="block text-sm font-medium text-gray-200 mb-1">
              Nama Lokasi
            </label>
            <input
              type="text"
              id="locName"
              formControlName="name" 
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Misal: Hutan Ajaib, Kota Cyber..."
              required
            />
            @if (locationForm.controls['name'].invalid && (locationForm.controls['name'].dirty || locationForm.controls['name'].touched)) {
              <div class="text-red-400 text-xs mt-1"> Nama tidak boleh kosong. </div>
            }
          </div>

          <div class="mb-6">
             <label for="locDesc" class="block text-sm font-medium text-gray-200 mb-1">
               Deskripsi Singkat (Opsional)
             </label>
             <textarea
               id="locDesc"
               formControlName="description" 
               rows="3"
               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
               placeholder="Deskripsi fisik, suasana, atau catatan..."
             ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              (click)="close()"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-gray-200 transition duration-150"
            >
              Batal
            </button>
            <button
              type="submit"
              [disabled]="locationForm.invalid || isLoading()" 
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
export class AddLocationModalComponent {
  show = input.required<boolean>();
  locationToEdit = input<ILocation | null>(null);
  closeModal = output<void>();

  private fb = inject(FormBuilder);
  private bookState = inject(CurrentBookStateService); 

  isLoading = signal(false);

  locationForm = this.fb.group({
    name: ['', Validators.required],
    description: [''] 
  });

  constructor() {
    effect(() => {
      const location = this.locationToEdit();
      const isVisible = this.show();

      if (location && isVisible) {
        this.locationForm.patchValue({
          name: location.name,
          description: location.description
        });
      } else {
        this.locationForm.reset({ name: '', description: '' });
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.locationForm.invalid || this.isLoading()) {
      this.locationForm.markAllAsTouched();
      return;
    }

    const { name, description } = this.locationForm.value;
    const location = this.locationToEdit();

    this.isLoading.set(true);
    try {
      if (location && location.id) {
        await this.bookState.updateLocation(location.id, { name: name!, description: description! });
      } else {
        await this.bookState.addLocation(name!, description!);
      }
      this.close();
    } catch (error) {
      console.error("Gagal menyimpan lokasi:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
