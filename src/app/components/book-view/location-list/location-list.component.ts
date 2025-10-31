// src/app/components/book-view/location-list/location-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import type { ILocation } from '../../../../types/data';
import { AddLocationModalComponent } from '../add-location-modal/add-location-modal.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmationService } from '../../../state/confirmation.service';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule, AddLocationModalComponent, IconComponent],
  template: `
    <div>
      <!-- Tombol Tambah -->
      <button 
        (click)="openAddModal()"
        class="mb-4 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md transition duration-150">
        + Tambah Lokasi
      </button>

      <!-- Tampilkan Loading -->
      @if (bookState.isLoadingLocations()) {
        <div class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-600 dark:border-accent-400"></div>
        </div>
      } @else if (bookState.filteredLocations(); as locations) {
         @if (locations.length > 0) {
            <!-- Daftar Lokasi -->
            <div class="space-y-3">
              @for (loc of locations; track loc.id) {
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start">
                  <!-- Info Lokasi -->
                  <div class="mr-4">
                     <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-200">{{ loc.name }}</h3>
                     <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{{ loc.description || 'Tidak ada deskripsi.' }}</p>
                  </div>
                  <!-- Tombol Aksi (Edit/Hapus) -->
                  <div class="flex-shrink-0 space-x-2 flex items-center">
                     <button (click)="openEditModal(loc)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Edit Lokasi">
                       <app-icon name="solid-pencil-20" class="w-5 h-5" />
                     </button>
                     <button (click)="deleteLocation(loc.id!, loc.name)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Hapus Lokasi">
                        <app-icon name="solid-trash-20" class="w-5 h-5" />
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           <!-- Pesan jika daftar kosong -->
            @if (bookState.contextualSearchTerm()) {
              <p class="text-center text-gray-500 dark:text-gray-400 py-6">Tidak ada lokasi ditemukan untuk "{{ bookState.contextualSearchTerm() }}".</p>
            } @else {
              <p class="text-center text-gray-500 dark:text-gray-400 py-6">Belum ada lokasi. Klik tombol di atas untuk menambah!</p>
            }
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
  private confirmationService = inject(ConfirmationService);
  
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
    this.confirmationService.requestConfirmation({
      message: `Yakin ingin menghapus lokasi "${name}"?`,
      onConfirm: () => this.bookState.deleteLocation(id)
    });
  }
}