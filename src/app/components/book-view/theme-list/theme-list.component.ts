// src/app/components/book-view/theme-list/theme-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import type { ITheme } from '../../../../types/data';
import { AddThemeModalComponent } from '../add-theme-modal/add-theme-modal.component';

@Component({
  selector: 'app-theme-list',
  standalone: true,
  imports: [CommonModule, AddThemeModalComponent],
  template: `
    <div>
      <!-- Tombol Tambah -->
      <button 
        (click)="openAddModal()"
        class="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150">
        + Tambah Tema
      </button>

      <!-- Tampilkan Loading -->
      @if (bookState.isLoading() === 'loading') {
        <div class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      } @else if (bookState.themes(); as themes) {
         @if (themes.length > 0) {
            <!-- Daftar Tema -->
            <div class="space-y-3">
              @for (theme of themes; track theme.id) {
                <div class="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start">
                  <!-- Info Tema -->
                  <div class="mr-4">
                     <h3 class="text-lg font-semibold text-white">{{ theme.name }}</h3>
                     <p class="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{{ theme.description || 'Tidak ada deskripsi.' }}</p>
                  </div>
                  <!-- Tombol Aksi (Edit/Hapus) -->
                  <div class="flex-shrink-0 space-x-2">
                     <button (click)="openEditModal(theme)" class="text-blue-400 hover:text-blue-300 p-1" aria-label="Edit Tema">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /> </svg>
                     </button>
                     <button (click)="deleteTheme(theme.id!, theme.name)" class="text-red-400 hover:text-red-300 p-1" aria-label="Hapus Tema">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           <!-- Pesan jika daftar kosong -->
           <p class="text-center text-gray-500 py-6">Belum ada tema. Klik tombol di atas untuk menambah!</p>
         }
      }

      <!-- Modal Tambah/Edit -->
      @if (showModal()) {
        <app-add-theme-modal
          [show]="showModal()" 
          [themeToEdit]="editingTheme()"
          (closeModal)="closeModal()">
        </app-add-theme-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeListComponent {
  public bookState = inject(CurrentBookStateService); 
  
  showModal: WritableSignal<boolean> = signal(false);
  editingTheme: WritableSignal<ITheme | null> = signal(null);

  openAddModal(): void {
    this.editingTheme.set(null);
    this.showModal.set(true);
  }

  openEditModal(theme: ITheme): void {
    this.editingTheme.set(theme);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  deleteTheme(id: number, name: string): void {
    if (window.confirm(`Yakin ingin menghapus tema "${name}"?`)) {
      this.bookState.deleteTheme(id).catch(err => console.error("Gagal menghapus:", err));
    }
  }
}
