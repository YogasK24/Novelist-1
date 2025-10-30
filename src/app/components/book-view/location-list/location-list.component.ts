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
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start hover:bg-gray-100 dark:hover:bg-gray-700/80 transition duration-150">
                  <!-- Info Lokasi -->
                  <div class="mr-4">
                     <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ loc.name }}</h3>
                     <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{{ loc.description || 'Tidak ada deskripsi.' }}</p>
                  </div>
                  <!-- Tombol Aksi (Edit/Hapus) -->
                  <div class="flex-shrink-0 space-x-2 flex items-center">
                     <button (click)="openEditModal(loc)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1" aria-label="Edit Lokasi">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                         <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                       </svg>
                     </button>
                     <button (click)="deleteLocation(loc.id!, loc.name)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1" aria-label="Hapus Lokasi">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                          <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.84 0a.75.75 0 01-1.5.06l-.3 7.5a.75.75 0 111.5-.06l.3-7.5z" clip-rule="evenodd" />
                        </svg>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           <!-- Pesan jika daftar kosong -->
           <p class="text-center text-gray-500 dark:text-gray-500 py-6">Belum ada lokasi. Klik tombol di atas untuk menambah!</p>
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