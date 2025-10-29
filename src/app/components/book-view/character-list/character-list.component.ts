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
                     class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-start cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/80 transition duration-150">
                  <div class="mr-4 flex-grow">
                     <h3 class="text-lg font-semibold text-slate-800 dark:text-white">{{ char.name }}</h3>
                     <p class="text-sm text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap line-clamp-2">{{ char.description || 'Tidak ada deskripsi.' }}</p>
                  
                      @if (char.relationships && char.relationships.length > 0) {
                        <div class="mt-3 border-t border-slate-200 dark:border-slate-700 pt-2">
                          <h4 class="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">Hubungan</h4>
                          <div class="flex flex-wrap gap-2">
                            @for (rel of char.relationships; track rel.targetId) {
                              @if (bookState.characterMap().get(rel.targetId); as targetChar) {
                                <span class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                                  {{ rel.type }}: <span class="font-medium text-slate-800 dark:text-white">{{ targetChar.name }}</span>
                                </span>
                              }
                            }
                          </div>
                        </div>
                      }
                  </div>
                  <div class="flex-shrink-0 space-x-2 flex items-center">
                     <button (click)="openEditModal(char); $event.stopPropagation()" class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 p-1" aria-label="Edit Karakter">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /> </svg>
                     </button>
                     <button (click)="deleteCharacter(char.id!, char.name); $event.stopPropagation()" class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1" aria-label="Hapus Karakter">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           <p class="text-center text-slate-500 py-6">Belum ada karakter. Klik tombol di atas untuk menambah!</p>
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