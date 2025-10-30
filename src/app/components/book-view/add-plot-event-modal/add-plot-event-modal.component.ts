// src/app/components/book-view/add-plot-event-modal/add-plot-event-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import type { IPlotEvent } from '../../../../types/data'; // Import tipe relasi
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-add-plot-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" aria-modal="true" role="dialog">
      <div 
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()">

        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
            {{ eventToEdit() ? 'Edit Event Plot' : 'Tambah Event Plot Baru' }}
          </h2>
          <button (click)="close()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form [formGroup]="eventForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="eventName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Event/Scene</label>
            <input
              type="text"
              id="eventName"
              formControlName="title"
              class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 
                     focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
              placeholder="Misal: Pertemuan Pertama, Klimaks..."
              required
            />
            @if (eventForm.controls['title'].invalid && (eventForm.controls['title'].dirty || eventForm.controls['title'].touched)) {
              <div class="text-red-400 text-xs mt-1"> Judul tidak boleh kosong. </div>
            }
          </div>

          <div class="mb-4">
             <label for="eventSummary" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ringkasan (Opsional)</label>
             <textarea
               id="eventSummary"
               formControlName="summary"
               rows="3"
               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                      text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 
                      focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
               placeholder="Apa yang terjadi di event/scene ini?"
             ></textarea>
          </div>
          
          <div class="mb-4">
             <label for="locationId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi Peristiwa</label>
             <select id="locationId" formControlName="locationId"
               class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                      text-gray-900 dark:text-gray-200 
                      focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500">
               <option [ngValue]="null">-- Pilih Lokasi (Opsional) --</option>
               @for (loc of bookState.locations(); track loc.id) {
                 <option [ngValue]="loc.id">{{ loc.name }}</option>
               }
             </select>
          </div>

          <div class="mb-6">
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Karakter Terlibat</label>
             <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-md max-h-32 overflow-y-auto">
               @for (char of bookState.characters(); track char.id) {
                 <div class="flex items-center mb-1">
                   <input type="checkbox" 
                     [id]="'char-' + char.id" 
                     [checked]="characterIds.value.includes(char.id!)"
                     (change)="onCharacterCheck(char.id!, $event)"
                     class="h-4 w-4 text-purple-600 bg-gray-200 dark:bg-gray-900 border-gray-400 dark:border-gray-600 rounded 
                            focus:ring-purple-600 dark:focus:ring-purple-500">
                   <label [for]="'char-' + char.id" class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ char.name }}</label>
                 </div>
               }
               @if (bookState.characters().length === 0) {
                  <p class="text-xs text-gray-500">Tambahkan Karakter di tab Karakter terlebih dahulu.</p>
               }
             </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button type="button" (click)="close()" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 
                                                        text-gray-800 dark:text-gray-200 rounded-md transition duration-150"> Batal </button>
            <button type="submit" [disabled]="eventForm.invalid || isLoading()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md 
                                                                                   disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"> 
              {{ isLoading() ? 'Menyimpan...' : 'Simpan' }} 
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPlotEventModalComponent {
  show = input.required<boolean>();
  eventToEdit = input<IPlotEvent | null>(null);
  closeModal = output<void>();

  private fb = inject(FormBuilder);
  public bookState = inject(CurrentBookStateService);
  isLoading = signal(false);

  eventForm = this.fb.group({
    title: ['', Validators.required],
    summary: [''],
    locationId: [null as number | null], // Default null
    characterIds: this.fb.array<FormControl<number>>([])
  });
  
  get characterIds(): FormArray<FormControl<number>> {
    return this.eventForm.get('characterIds') as FormArray<FormControl<number>>;
  }

  constructor() {
    effect(() => {
      const event = this.eventToEdit();
      const isVisible = this.show();

      if (event && isVisible) {
        this.eventForm.patchValue({
          title: event.title,
          summary: event.summary,
          locationId: event.locationId
        });
        this.setCharacterFormArray(event.characterIds);
      } else if (!event && isVisible) {
        this.eventForm.reset({ title: '', summary: '', locationId: null });
        this.setCharacterFormArray([]);
      }
    });
  }
  
  private setCharacterFormArray(ids: number[]): void {
      const formArray = this.fb.array((ids || []).map(id => this.fb.control(id)));
      this.eventForm.setControl('characterIds', formArray);
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
    if (this.eventForm.invalid || this.isLoading()) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const { title, summary, locationId } = this.eventForm.value;
    const characterIds = this.characterIds.value as number[];
    const event = this.eventToEdit();
    
    const uniqueCharacterIds = [...new Set(characterIds)].filter(id => id != null) as number[];

    this.isLoading.set(true);
    try {
      if (event && event.id != null) {
        await this.bookState.updatePlotEvent(event.id, { 
            title: title!, 
            summary: summary!, 
            locationId: locationId!,
            characterIds: uniqueCharacterIds
        }); 
      } else {
        await this.bookState.addPlotEvent(title!, summary!, locationId!, uniqueCharacterIds);
      }
      this.close();
    } catch (error) {
      console.error("Gagal menyimpan event plot:", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
