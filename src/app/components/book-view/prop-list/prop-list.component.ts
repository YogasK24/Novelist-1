// src/app/components/book-view/prop-list/prop-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import type { IProp } from '../../../../types/data';
import { AddPropModalComponent } from '../add-prop-modal/add-prop-modal.component';

@Component({
  selector: 'app-prop-list',
  standalone: true,
  imports: [CommonModule, AddPropModalComponent],
  template: `
    <div>
      <!-- Tombol Tambah -->
      <button 
        (click)="openAddModal()"
        class="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150">
        + Tambah Properti
      </button>

      <!-- Tampilkan Loading -->
      @if (bookState.isLoadingChildren().props) {
        <div class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-500 dark:border-slate-400"></div>
        </div>
      } @else if (bookState.props(); as props) {
         @if (props.length > 0) {
            <!-- Daftar Properti -->
            <div class="space-y-3">
              @for (prop of props; track prop.id) {
                <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                  <!-- Info Properti -->
                  <div class="mr-4">
                     <h3 class="text-lg font-semibold text-slate-800 dark:text-white">{{ prop.name }}</h3>
                     <p class="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap">{{ prop.description || 'Tidak ada deskripsi.' }}</p>
                  </div>
                  <!-- Tombol Aksi (Edit/Hapus) -->
                  <div class="flex-shrink-0 space-x-2">
                     <button (click)="openEditModal(prop)" class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-1" aria-label="Edit Properti">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /> </svg>
                     </button>
                     <button (click)="deleteProp(prop.id!, prop.name)" class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1" aria-label="Hapus Properti">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           <!-- Pesan jika daftar kosong -->
           <p class="text-center text-slate-500 py-6">Belum ada properti/item. Klik tombol di atas untuk menambah!</p>
         }
      }

      <!-- Modal Tambah/Edit -->
      @if (showModal()) {
        <app-add-prop-modal
          [show]="showModal()" 
          [propToEdit]="editingProp()"
          (closeModal)="closeModal()">
        </app-add-prop-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropListComponent {
  public bookState = inject(CurrentBookStateService); 
  
  showModal: WritableSignal<boolean> = signal(false);
  editingProp: WritableSignal<IProp | null> = signal(null);

  openAddModal(): void {
    this.editingProp.set(null);
    this.showModal.set(true);
  }

  openEditModal(prop: IProp): void {
    this.editingProp.set(prop);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  deleteProp(id: number, name: string): void {
    if (window.confirm(`Yakin ingin menghapus properti "${name}"?`)) {
      this.bookState.deleteProp(id).catch(err => console.error("Gagal menghapus:", err));
    }
  }
}