// src/app/components/book-view/theme-list/theme-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import type { ITheme } from '../../../../types/data';
import { AddThemeModalComponent } from '../add-theme-modal/add-theme-modal.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmationService } from '../../../state/confirmation.service';

@Component({
  selector: 'app-theme-list',
  standalone: true,
  imports: [CommonModule, AddThemeModalComponent, IconComponent],
  template: `
    <div>
      <!-- Tombol Tambah -->
      <button 
        (click)="openAddModal()"
        class="mb-4 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-900">
        + Tambah Tema
      </button>

      <!-- Tampilkan Loading -->
      @if (bookState.isLoadingThemes()) {
        <div class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-500 dark:border-slate-400"></div>
        </div>
      } @else if (bookState.filteredThemes(); as themes) {
         @if (themes.length > 0) {
            <!-- Daftar Tema -->
            <div class="space-y-3">
              @for (theme of themes; track theme.id) {
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start hover:bg-gray-100 dark:hover:bg-gray-700/80 transition duration-150">
                  <!-- Info Tema -->
                  <div class="mr-4">
                     <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ theme.name }}</h3>
                     <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{{ theme.description || 'Tidak ada deskripsi.' }}</p>
                  </div>
                  <!-- Tombol Aksi (Edit/Hapus) -->
                  <div class="flex-shrink-0 space-x-2 flex items-center">
                     <button (click)="openEditModal(theme)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Edit Tema">
                       <app-icon name="solid-pencil-20" class="w-5 h-5" />
                     </button>
                     <button (click)="deleteTheme(theme.id!, theme.name)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Hapus Tema">
                        <app-icon name="solid-trash-20" class="w-5 h-5" />
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           @if (bookState.contextualSearchTerm()) {
             <p class="text-center text-gray-500 dark:text-gray-400 py-6">
               Tidak ada tema ditemukan untuk "{{ bookState.contextualSearchTerm() }}".
             </p>
           } @else {
             <p class="text-center text-gray-500 dark:text-gray-400 py-6">Belum ada tema. Klik tombol di atas untuk menambah!</p>
           }
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
  private confirmationService = inject(ConfirmationService);
  
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
    this.confirmationService.requestConfirmation({
      message: `Yakin ingin menghapus tema "${name}"?`,
      onConfirm: () => this.bookState.deleteTheme(id)
    });
  }
}
