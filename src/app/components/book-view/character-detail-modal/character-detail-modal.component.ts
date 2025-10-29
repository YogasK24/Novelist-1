// src/app/components/book-view/character-detail-modal/character-detail-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ICharacter } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-character-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" aria-modal="true" role="dialog">
      <div 
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()">

        @if (character(); as currentCharacter) {
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-white">
              {{ currentCharacter.name }}
            </h2>
            <button (click)="close()" class="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
          </div>

          <div class="max-h-[70vh] overflow-y-auto pr-2">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Deskripsi</h3>
              <p class="text-gray-300 whitespace-pre-wrap mb-6 bg-gray-700/50 p-3 rounded-md">
                {{ currentCharacter.description || 'Tidak ada deskripsi.' }}
              </p>

              <div>
                  <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Hubungan</h3>
                  @if (currentCharacter.relationships && currentCharacter.relationships.length > 0; as relationships) {
                      <div class="space-y-2">
                          @for (rel of currentCharacter.relationships; track rel.targetId) {
                              @if (bookState.characterMap().get(rel.targetId); as targetChar) {
                                  <div class="flex items-center gap-3 bg-gray-700/50 p-3 rounded-md">
                                      <span class="text-sm font-medium text-purple-300">{{ rel.type }}:</span>
                                      <span class="text-white flex-grow">{{ targetChar.name }}</span>
                                  </div>
                              } @else {
                                  <div class="text-sm text-gray-400 italic bg-gray-700/50 p-3 rounded-md">
                                      {{ rel.type }} dengan [Karakter ID {{ rel.targetId }} - Tidak Ditemukan]
                                  </div>
                              }
                          }
                      </div>
                  } @else {
                      <p class="text-gray-400 italic">Tidak ada hubungan yang tercatat.</p>
                  }
              </div>
              
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterDetailModalComponent {
  show = input.required<boolean>();
  character = input<ICharacter | null>(null);
  closeModal = output<void>();

  public bookState = inject(CurrentBookStateService);

  close(): void {
    this.closeModal.emit();
  }
}
