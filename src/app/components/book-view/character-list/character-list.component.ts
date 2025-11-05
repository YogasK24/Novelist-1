// src/app/components/book-view/character-list/character-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CurrentBookStateService } from '../../../state/current-book-state.service'; 
import type { ICharacter } from '../../../../types/data';
import { AddCharacterModalComponent } from '../add-character-modal/add-character-modal.component'; 
import { CharacterDetailModalComponent } from '../character-detail-modal/character-detail-modal.component'; 
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmationService } from '../../../state/confirmation.service';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, AddCharacterModalComponent, CharacterDetailModalComponent, IconComponent],
  template: `
    <div>
      <button 
        (click)="openAddModal()"
        class="mb-4 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md transition-all duration-150 hover:scale-105">
        + Tambah Karakter
      </button>

      @if (bookState.isLoadingCharacters()) {
        <div class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-600 dark:border-accent-400"></div>
        </div>
      } @else if (bookState.filteredCharacters(); as characters) { 
         @if (characters.length > 0) {
            <div class="space-y-3">
              @for (char of characters; track char.id) {
                <div (click)="viewCharacterDetails(char)"
                     class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-all duration-150 hover:scale-102">
                  
                  <div class="flex-shrink-0 mr-4 mt-1">
                      <div [style.background-color]="getAvatarColor(char.name)" 
                           class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white text-lg">
                           {{ getInitials(char.name) }}
                      </div>
                  </div>

                  <div class="flex-grow">
                     <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-200">{{ char.name }}</h3>
                     <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap line-clamp-2">{{ char.description || 'Tidak ada deskripsi.' }}</p>
                  
                      @if (char.relationships && char.relationships.length > 0) {
                        <div class="mt-3 border-t border-gray-300 dark:border-gray-700 pt-2">
                          <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">Hubungan</h4>
                          <div class="flex flex-wrap gap-2">
                            @for (rel of char.relationships; track rel.targetId) {
                              @if (bookState.characterMap().get(rel.targetId); as targetChar) {
                                <span class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                                  {{ rel.type }}: <span class="font-medium text-gray-900 dark:text-gray-200">{{ targetChar.name }}</span>
                                </span>
                              }
                            }
                          </div>
                        </div>
                      }
                  </div>
                  <div class="flex-shrink-0 space-x-2 flex items-center">
                     <button (click)="openEditModal(char); $event.stopPropagation()" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1" aria-label="Edit Karakter">
                       <app-icon name="solid-pencil-20" class="w-5 h-5" />
                     </button>
                     <button (click)="onDeleteCharacter(char); $event.stopPropagation()" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1" aria-label="Hapus Karakter">
                        <app-icon name="solid-trash-20" class="w-5 h-5" />
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           @if (bookState.contextualSearchTerm()) {
             <p class="text-center text-gray-500 dark:text-gray-400 py-6">
               Tidak ada karakter ditemukan untuk "{{ bookState.contextualSearchTerm() }}".
             </p>
           } @else {
             <p class="text-center text-gray-500 dark:text-gray-400 py-6">Belum ada karakter. Klik tombol di atas untuk menambah!</p>
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
    public bookState = inject(CurrentBookStateService);
    private confirmationService = inject(ConfirmationService);
    showModal: WritableSignal<boolean> = signal(false);
    editingCharacter: WritableSignal<ICharacter | null> = signal(null);
    showDetailModal: WritableSignal<boolean> = signal(false);
    viewingCharacter: WritableSignal<ICharacter | null> = signal(null);
    private elementToRestoreFocus: HTMLElement | null = null;
    
    // --- NEW: For deep linking ---
    entityToEditId = input<number | undefined>();
    editHandled = output<void>();

    constructor() {
      effect(() => {
        const idToEdit = this.entityToEditId();
        const characters = this.bookState.characters();
        if (idToEdit !== undefined && characters.length > 0) {
          Promise.resolve().then(() => {
            const character = characters.find(c => c.id === idToEdit);
            if (character) {
              this.openEditModal(character);
              this.editHandled.emit();
            }
          });
        }
      });
    }

    openAddModal(): void {
        this.elementToRestoreFocus = document.activeElement as HTMLElement;
        this.editingCharacter.set(null);
        this.showModal.set(true);
    }

    openEditModal(character: ICharacter): void {
        this.elementToRestoreFocus = document.activeElement as HTMLElement;
        this.editingCharacter.set(character);
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        setTimeout(() => {
            this.elementToRestoreFocus?.focus?.();
            this.elementToRestoreFocus = null;
        }, 300);
    }

    onDeleteCharacter(character: ICharacter): void {
      this.confirmationService.requestConfirmation({
        message: `Yakin ingin menghapus karakter "${character.name}"?`,
        onConfirm: () => {
          if (character.id !== undefined) {
            this.bookState.deleteCharacter(character.id);
          }
        }
      });
    }

    viewCharacterDetails(character: ICharacter): void {
        this.elementToRestoreFocus = document.activeElement as HTMLElement;
        this.viewingCharacter.set(character);
        this.showDetailModal.set(true);
    }

    closeDetailModal(): void {
        this.showDetailModal.set(false);
        setTimeout(() => {
            this.elementToRestoreFocus?.focus?.();
            this.elementToRestoreFocus = null;
        }, 300);
    }

    getInitials(name: string): string {
        if (!name) return '?';
        const words = name.trim().split(/\s+/);
        if (words.length > 1) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        } else if (words.length === 1 && words[0].length > 0) {
            return words[0][0].toUpperCase();
        }
        return '?';
    }
    
    getAvatarColor(name: string): string {
        if (!name) return 'hsl(200, 70%, 50%)';
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = hash % 360;
        const s = 60 + (hash % 10);
        const l = 40 + (hash % 10);
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
}