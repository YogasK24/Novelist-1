// src/app/components/book-view/location-list/location-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import type { ILocation } from '../../../../types/data';
import { AddLocationModalComponent } from '../add-location-modal/add-location-modal.component';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule, AddLocationModalComponent],
  template: `
    <div>
      <!-- Tombol Tambah -->
      <button 
        (click)="openAddModal()"
        class="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150">
        + Tambah Lokasi
      </button>

      <!-- Tampilkan Loading -->
      @if (bookState.isLoadingChildren().locations) {
        <div class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-500 dark:border-slate-400"></div>
        </div>
      } @else if (bookState.locations(); as locations) {
         @if (locations.length > 0) {
            <!-- Daftar Lokasi -->
            <div class="space-y-3">
              @for (loc of locations; track loc.id) {
                <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <!-- Info Lokasi -->
                  <div class="mr-4">
                     <h3 class="text-lg font-semibold text-slate-800 dark:text-white">{{ loc.name }}</h3>
                     <p class="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap">{{ loc.description || 'Tidak ada deskripsi.' }}</p>
                  </div>
                  <!-- Tombol Aksi (Edit/Hapus) -->
                  <div class="flex-shrink-0 space-x-2">
                     <button (click)="openEditModal(loc)" class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-1" aria-label="Edit Lokasi">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /> </svg>
                     </button>
                     <button (click)="deleteLocation(loc.id!, loc.name)" class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1" aria-label="Hapus Lokasi">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           <!-- Pesan jika daftar kosong -->
           <p class="text-center text-slate-500 py-6">Belum ada lokasi. Klik tombol di atas untuk menambah!</p>
         }
      }

      <!-- Modal Tambah/Edit -->
      @if (showModal()) {
        <app-add-location-modal
          [show]="showModal()" 
          [locationToEdit]="editingLocation()"
          (closeModal)="closeModal()">
        </app-add-location-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationListComponent {
  public bookState = inject(CurrentBookStateService); 
  
  showModal: WritableSignal<boolean> = signal(false);
  editingLocation: WritableSignal<ILocation | null> = signal(null);

  openAddModal(): void {
    this.editingLocation.set(null);
    this.showModal.set(true);
  }

  openEditModal(location: ILocation): void {
    this.editingLocation.set(location);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  deleteLocation(id: number, name: string): void {
    if (window.confirm(`Yakin ingin menghapus lokasi "${name}"?`)) {
      this.bookState.deleteLocation(id).catch(err => console.error("Gagal menghapus:", err));
    }
  }
}