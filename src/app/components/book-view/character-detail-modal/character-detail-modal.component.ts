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
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" aria-modal="true" role="dialog">
      <div 
        class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()">

        @if (character(); as currentCharacter) {
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ currentCharacter.name }}
            </h2>
            <button (click)="close()" class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-purple-500 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="max-h-[70vh] overflow-y-auto pr-2">
              <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</h3>
              <p class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap mb-6">
                {{ currentCharacter.description || 'Tidak ada deskripsi.' }}
              </p>

              @if (currentCharacter.relationships && currentCharacter.relationships.length > 0) {
                <div>
                  <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Hubungan</h3>
                  <div class="space-y-2">
                    @for (rel of currentCharacter.relationships; track rel.targetId) {
                      @if (bookState.characterMap().get(rel.targetId); as targetChar) {
                        <div class="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md flex justify-between items-center">
                          <div>
                            <span class="font-semibold text-slate-800 dark:text-slate-200">{{ targetChar.name }}</span>
                            <span class="text-slate-600 dark:text-slate-400"> — {{ rel.type }}</span>
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// FIX: Added the missing class definition and export for the component.
export class CharacterDetailModalComponent {
  show = input.required<boolean>();
  character = input<ICharacter | null>(null);
  closeModal = output<void>();

  bookState = inject(CurrentBookStateService);

  close(): void {
    this.closeModal.emit();
  }
}
