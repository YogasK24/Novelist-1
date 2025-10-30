// src/app/components/book-view/character-list/character-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CurrentBookStateService } from '../../../state/current-book-state.service'; 
import type { ICharacter } from '../../../../types/data';
import { AddCharacterModalComponent } from '../add-character-modal/add-character-modal.component'; 
import { CharacterDetailModalComponent } from '../character-detail-modal/character-detail-modal.component'; // <-- Import Modal Detail

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, AddCharacterModalComponent, CharacterDetailModalComponent], // <-- Daftarkan Modal Detail
  template: `
    <div>
      <button 
        (click)="openAddModal()"
        class="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150">
        + Tambah Karakter
      </button>

      @if (bookState.isLoadingChildren().characters) {
        <div class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-500 dark:border-slate-400"></div>
        </div>
      } @else if (bookState.characters(); as characters) {
         @if (characters.length > 0) {
            <div class="space-y-3">
              @for (char of characters; track char.id) {
                <div (click)="viewCharacterDetails(char)"
                     class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition duration-150">
                  <div class="mr-4 flex-grow">
                     <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ char.name }}</h3>
                     <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap line-clamp-2">{{ char.description || 'Tidak ada deskripsi.' }}</p>
                  
                      @if (char.relationships && char.relationships.length > 0) {
                        <div class="mt-3 border-t border-gray-300 dark:border-gray-700 pt-2">
                          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">Hubungan</h4>
                          <div class="flex flex-wrap gap-2">
                            @for (rel of char.relationships; track rel.targetId) {
                              @if (bookState.characterMap().get(rel.targetId); as targetChar) {
                                <span class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                                  {{ rel.type }}: <span class="font-medium text-gray-900 dark:text-white">{{ targetChar.name }}</span>
                                </span>
                              }
                            }
                          </div>
                        </div>
                      }
                  </div>
                  <div class="flex-shrink-0 space-x-2 flex items-center">
                     <button (click)="openEditModal(char); $event.stopPropagation()" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1" aria-label="Edit Karakter">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                         <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                       </svg>
                     </button>
                     <button (click)="deleteCharacter(char.id!, char.name); $event.stopPropagation()" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1" aria-label="Hapus Karakter">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                          <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.84 0a.75.75 0 01-1.5.06l-.3 7.5a.75.75 0 111.5-.06l.3-7.5z" clip-rule="evenodd" />
                        </svg>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           <p class="text-center text-gray-500 dark:text-gray-500 py-6">Belum ada karakter. Klik tombol di atas untuk menambah!</p>
         }
      }

      @if (showModal()) {
        <app-add-character-modal
          [show]="showModal()" 
          [characterToEdit]="editingCharacter()"
          (closeModal)="closeModal()">
        </app-add-character-modal>
      }
      
      @if (showDetailModal()) {
        <app-character-detail-modal
          [show]="showDetailModal()"
          [character]="viewingCharacter()"
          (closeModal)="closeDetailModal()">
        </app-character-detail-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterListComponent {
  // Inject state service
  public bookState = inject(CurrentBookStateService); 

  // Gunakan Signal untuk state modal CRUD
  showModal: WritableSignal<boolean> = signal(false);
  editingCharacter: WritableSignal<ICharacter | null> = signal(null);

  // State BARU untuk Modal Detail
  showDetailModal: WritableSignal<boolean> = signal(false);
  viewingCharacter: WritableSignal<ICharacter | null> = signal(null);

  openAddModal(): void {
    this.editingCharacter.set(null); // Mode tambah
    this.showModal.set(true);
  }

  openEditModal(character: ICharacter): void {
    this.editingCharacter.set(character); // Mode edit
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  deleteCharacter(id: number, name: string): void {
    if (window.confirm(`Yakin ingin menghapus karakter "${name}"?`)) {
      this.bookState.deleteCharacter(id).catch(err => console.error("Gagal menghapus:", err)); 
    }
  }
  
  // Metode BARU: Membuka modal detail
  viewCharacterDetails(character: ICharacter): void {
      this.viewingCharacter.set(character);
      this.showDetailModal.set(true);
  }
  
  closeDetailModal(): void {
      this.showDetailModal.set(false);
  }
}