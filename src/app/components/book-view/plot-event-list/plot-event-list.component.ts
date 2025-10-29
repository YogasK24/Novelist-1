// src/app/components/book-view/plot-event-list/plot-event-list.component.ts
// GANTI SEMUA ISI FILE INI

import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CurrentBookStateService } from '../../../state/current-book-state.service'; 
import type { IPlotEvent } from '../../../../types/data'; // Ganti tipe
import { AddPlotEventModalComponent } from '../add-plot-event-modal/add-plot-event-modal.component'; // Import modal event

@Component({
  selector: 'app-plot-event-list', // Selector sudah benar
  standalone: true,
  imports: [CommonModule, AddPlotEventModalComponent], // Import modal event
  template: `
    <div>
      <button 
        (click)="openAddModal()"
        class="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150">
        + Tambah Event Plot
      </button>

      @if (bookState.isLoading() === 'loading') {
        <div class="flex justify-center items-center py-6"> <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div> </div>
      } @else if (bookState.plotEvents(); as plotEvents) {
         @if (plotEvents.length > 0) {
            <div class="space-y-3">
              @for (event of plotEvents; track event.id) {
                <div class="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start group">
                  <div class="mr-4 overflow-hidden flex-grow"> 
                     <h3 class="text-lg font-semibold text-white truncate">{{ event.order }}. {{ event.title }}</h3> 
                     
                     <!-- Info Relasi -->
                     <div class="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                       @if (event.locationId) {
                         <div class="flex items-center gap-1.5" title="Lokasi">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                             <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                           </svg>
                           <span>{{ getLocationName(event.locationId) }}</span>
                         </div>
                       }
                       @if (getCharacterNames(event.characterIds); as charNames) {
                         @if (charNames.length > 0) {
                           <div class="flex items-center gap-1.5" title="Karakter">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                               <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                             </svg>
                             <span class="truncate">{{ charNames.join(', ') }}</span>
                           </div>
                         }
                       }
                     </div>

                     <p class="text-sm text-gray-400 mt-2 whitespace-pre-wrap break-words"> 
                        {{ event.summary || 'Tidak ada ringkasan.' }}
                     </p>
                  </div>
                  <div class="flex-shrink-0 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button (click)="openEditModal(event)" class="text-blue-400 hover:text-blue-300 p-1" aria-label="Edit Event">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /> </svg>
                     </button>
                     <button (click)="deletePlotEvent(event.id!, event.title)" class="text-red-400 hover:text-red-300 p-1" aria-label="Hapus Event">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           <p class="text-center text-gray-500 py-6">Belum ada event plot. Klik tombol di atas untuk menambah!</p>
         }
      }

      @if (showModal()) {
        <app-add-plot-event-modal
          [show]="showModal()" 
          [eventToEdit]="editingEvent()"
          (closeModal)="closeModal()">
        </app-add-plot-event-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlotEventListComponent {
  public bookState = inject(CurrentBookStateService); 
  
  showModal: WritableSignal<boolean> = signal(false);
  editingEvent: WritableSignal<IPlotEvent | null> = signal(null);

  openAddModal(): void {
    this.editingEvent.set(null); 
    this.showModal.set(true);
  }

  openEditModal(event: IPlotEvent): void {
    this.editingEvent.set(event); 
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  deletePlotEvent(id: number, name: string): void {
    if (window.confirm(`Yakin ingin menghapus event "${name}"?`)) {
      this.bookState.deletePlotEvent(id).catch(err => console.error("Gagal menghapus:", err));
    }
  }

  // --- Helper Functions for Template ---

  getLocationName(locationId: number | null): string {
    if (locationId === null) {
      return '';
    }
    const location = this.bookState.locations().find(l => l.id === locationId);
    return location ? location.name : 'Lokasi tidak ditemukan';
  }

  getCharacterNames(characterIds: number[]): string[] {
    if (!characterIds || characterIds.length === 0) {
      return [];
    }
    const allCharacters = this.bookState.characters();
    return characterIds
      .map(id => allCharacters.find(c => c.id === id)?.name)
      .filter((name): name is string => !!name);
  }
}