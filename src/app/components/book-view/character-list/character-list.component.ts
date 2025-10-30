// src/app/components/book-view/character-list/character-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CurrentBookStateService } from '../../../state/current-book-state.service'; 
import type { ICharacter } from '../../../../types/data';
import { AddCharacterModalComponent } from '../add-character-modal/add-character-modal.component'; 
import { CharacterDetailModalComponent } from '../character-detail-modal/character-detail-modal.component';
import { CharacterListItemComponent } from '../character-list-item/character-list-item.component'; // <-- Import BARU

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, AddCharacterModalComponent, CharacterDetailModalComponent, CharacterListItemComponent], // <-- Daftarkan komponen baru
  template: `
    <div>
      <button 
        (click)="openAddModal()"
        class="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900">
        + Tambah Karakter
      </button>

      @if (bookState.isLoadingCharacters()) {
        <div class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-500 dark:border-slate-400"></div>
        </div>
      } @else if (bookState.filteredCharacters(); as characters) {
         @if (characters.length > 0) {
            <div class="space-y-3">
              @for (char of characters; track char.id) {
                <app-character-list-item
                  [character]="char"
                  (viewDetails)="viewCharacterDetails($event)"
                  (edit)="openEditModal($event)"
                  (delete)="onDeleteCharacter($event)"
                ></app-character-list-item>
              }
            </div>
         } @else {
            @if (bookState.contextualSearchTerm()) {
              <p class="text-center text-gray-500 dark:text-gray-500 py-6">Tidak ada karakter yang cocok dengan pencarian Anda.</p>
            } @else {
              <p class="text-center text-gray-500 dark:text-gray-500 py-6">Belum ada karakter. Klik tombol di atas untuk menambah!</p>
            }
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

  onDeleteCharacter(character: ICharacter): void {
    if (window.confirm(`Yakin ingin menghapus karakter "${character.name}"?`) && character.id) {
      this.bookState.deleteCharacter(character.id);
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
