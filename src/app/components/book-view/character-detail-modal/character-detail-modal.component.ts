// src/app/components/book-view/character-detail-modal/character-detail-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ICharacter } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { FocusTrapDirective } from '../../../directives/focus-trap.directive';

@Component({
  selector: 'app-character-detail-modal',
  standalone: true,
  imports: [CommonModule, IconComponent, FocusTrapDirective],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        appFocusTrap
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()" 
      >
        @if (character(); as char) {
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-4">
              <div [style.background-color]="getAvatarColor(char.name)" 
                   class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl flex-shrink-0">
                   {{ getInitials(char.name) }}
              </div>
              <div>
                <h2 class="text-2xl font-bold text-white">
                  {{ char.name }}
                </h2>
                <p class="text-sm text-gray-400">Detail Karakter</p>
              </div>
            </div>
            <button (click)="close()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent-500 rounded-full p-1">
              <app-icon name="outline-x-mark-24" class="w-6 h-6" />
            </button>
          </div>

          <div class="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Deskripsi</h3>
              <p class="text-gray-300 whitespace-pre-wrap">
                {{ char.description || 'Tidak ada deskripsi yang diberikan.' }}
              </p>
            </div>

            @if (char.relationships && char.relationships.length > 0) {
              <div>
                <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Hubungan</h3>
                <div class="space-y-2">
                  @for (rel of char.relationships; track rel.targetId) {
                    @if (bookState.characterMap().get(rel.targetId); as targetChar) {
                      <div class="flex items-center gap-2 bg-gray-700/50 p-3 rounded-md">
                        <span class="text-gray-300"><span class="font-medium text-accent-400">{{ rel.type }}</span> dengan <span class="font-medium text-accent-400">{{ targetChar.name }}</span></span>
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
export class CharacterDetailModalComponent {
  show = input.required<boolean>();
  character = input<ICharacter | null>(null);
  closeModal = output<void>();

  public bookState = inject(CurrentBookStateService);

  close(): void {
    this.closeModal.emit();
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
