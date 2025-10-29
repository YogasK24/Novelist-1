// src/app/components/book-view/add-plot-event-modal/add-plot-event-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import type { IPlotEvent } from '../../../../types/data'; // Ganti tipe
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-add-plot-event-modal', // Ganti selector
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
            {{ eventToEdit() ? 'Edit Event Plot' : 'Tambah Event Plot Baru' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <form [formGroup]="eventForm" (ngSubmit)="onSubmit()">
          <!-- Judul Event -->
          <div class="mb-4">
            <label for="eventName" class="block text-sm font-medium text-gray-300 mb-1">
              Judul Event/Scene
            </label>
            <input
              type="text"
              id="eventName"
              formControlName="title"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Misal: Pertemuan Pertama, Klimaks..." 
              required
            />
            @if (eventForm.controls['title'].invalid && (eventForm.controls['title'].dirty || eventForm.controls['title'].touched)) {
              <div class="text-red-400 text-xs mt-1"> Judul tidak boleh kosong. </div>
            }
          </div>

          <!-- Ringkasan Event -->
          <div class="mb-6">
             <label for="eventSummary" class="block text-sm font-medium text-gray-300 mb-1">
               Ringkasan (Opsional)
             </label>
             <textarea
               id="eventSummary"
               formControlName="summary"
               rows="3"
               class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
               placeholder="Apa yang terjadi di event/scene ini?"
             ></textarea>
          </div>

          <!-- Tombol Aksi -->
          <div class="flex justify-end space-x-3">
            <button type="button" (click)="close()"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition duration-150"> Batal </button>
            <button type="submit" [disabled]="eventForm.invalid" 
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white disabled:opacity-50 transition duration-150"> Simpan </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPlotEventModalComponent { // Ganti nama class
  show = input.required<boolean>();
  eventToEdit = input<IPlotEvent | null>(null); // Ganti tipe Input
  closeModal = output<void>();

  private fb = inject(FormBuilder);
  private bookState = inject(CurrentBookStateService); 

  eventForm: FormGroup = this.fb.group({ // Ganti nama form
      title: ['', Validators.required], 
      summary: [''] 
  }); 

  constructor() {
    effect(() => {
      const event = this.eventToEdit();
      const isVisible = this.show();

      if (event && isVisible) {
        this.eventForm.patchValue({ // Patch form event
          title: event.title,
          summary: event.summary
        });
      } else {
        this.eventForm.reset({ title: '', summary: '' }); 
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched(); 
      return;
    }

    // Ambil nilai title dan summary, pastikan tidak null
    const titleValue = this.eventForm.value.title ?? '';
    const summaryValue = this.eventForm.value.summary ?? '';
    const event = this.eventToEdit();

    try {
      if (event && event.id) { // Pastikan ID ada untuk update
        await this.bookState.updatePlotEvent(event.id, { title: titleValue, summary: summaryValue }); // Panggil updatePlotEvent
      } else {
        await this.bookState.addPlotEvent(titleValue, summaryValue); // Panggil addPlotEvent
      }
      this.close(); 
    } catch (error) {
      console.error("Gagal menyimpan event plot:", error); // Ganti pesan error
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
