// src/app/components/book-view/character-list-item/character-list-item.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ICharacter } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-character-list-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (character(); as char) {
      <div (click)="viewDetails.emit(char)"
           tabindex="0"
           (keydown.enter)="viewDetails.emit(char)"
           class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
        
        <div class="flex-shrink-0 mr-4 mt-1">
            <div [style.background-color]="getAvatarColor(char.name)" 
                 class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white text-lg">
                 {{ getInitials(char.name) }}
            </div>
        </div>

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
           <button (click)="onEdit($event)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Edit Karakter">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
               <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
             </svg>
           </button>
           <button (click)="onDelete($event)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Hapus Karakter">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.84 0a.75.75 0 01-1.5.06l-.3 7.5a.75.75 0 111.5-.06l.3-7.5z" clip-rule="evenodd" />
              </svg>
           </button>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterListItemComponent {
  character = input.required<ICharacter>();
  
  viewDetails = output<ICharacter>();
  edit = output<ICharacter>();
  delete = output<ICharacter>();

  public bookState = inject(CurrentBookStateService);

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(this.character());
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.character());
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
    if (!name) return 'hsl(200, 70%, 50%)'; // Default color
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h = hash % 360; // Hue (0-359)
    const s = 60 + (hash % 10); // Saturation (60-70%) - Hindari warna terlalu pucat/terlalu jenuh
    const l = 40 + (hash % 10); // Lightness (40-50%) - Hindari warna terlalu gelap/terlalu terang
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
}
