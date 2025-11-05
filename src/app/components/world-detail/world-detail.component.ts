// src/app/components/world-detail/world-detail.component.ts
import { Component, ChangeDetectionStrategy, effect, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../state/current-book-state.service';
import type { ICharacter, ILocation, IPlotEvent } from '../../../types/data';
import { IconComponent } from '../shared/icon/icon.component';

// Tipe untuk state tampilan internal
type ViewItem = { type: 'character', item: ICharacter } | 
                { type: 'location', item: ILocation } | 
                { type: 'event', item: IPlotEvent };

@Component({
  selector: 'app-world-detail',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="h-full flex flex-col">
      
      <div class="flex-shrink-0 flex items-center justify-between mb-4">
        @if (viewingItem() === null) {
          <h2 class="text-lg font-bold text-gray-900 dark:text-white pl-8">World Notes</h2>
        } @else {
          <button (click)="viewingItem.set(null)" 
                  class="flex items-center gap-1 text-sm text-accent-600 dark:text-accent-400 
                         hover:text-accent-800 dark:hover:text-accent-300 transition
                         focus:outline-none focus:ring-2 focus:ring-accent-500 rounded p-1">
            <app-icon name="outline-arrow-left-24" class="w-5 h-5"></app-icon>
            Kembali ke Daftar
          </button>
        }
      </div>

      <div class="flex-grow overflow-y-auto pr-2 min-h-0">

        @if (viewingItem() === null) {
          <div class="flex flex-col h-full">
            <div class="border-b border-gray-300 dark:border-gray-700 mb-4 flex-shrink-0">
              <nav class="flex space-x-4" aria-label="Tabs">
                @for (tab of tabs; track tab.key) {
                  <button 
                    (click)="activeTab.set(tab.key)"
                    [class.text-accent-600]="activeTab() === tab.key"
                    [class.dark:text-accent-400]="activeTab() === tab.key"
                    [class.border-accent-600]="activeTab() === tab.key"
                    [class.dark:border-accent-400]="activeTab() === tab.key"
                    [class.text-gray-600]="activeTab() !== tab.key"
                    [class.dark:text-gray-400]="activeTab() !== tab.key"
                    [class.border-transparent]="activeTab() !== tab.key"
                    class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm hover:text-gray-900 dark:hover:text-white transition focus:outline-none focus:ring-2 focus:ring-accent-400 rounded-t-md"
                  >
                    {{ tab.label }}
                  </button>
                }
              </nav>
            </div>
            
            <div class="space-y-2">
              @switch (activeTab()) {
                  @case ('characters') {
                      @if (bookState.isLoadingCharacters()) { <span class="loading-text">Loading...</span> }
                      @for (char of bookState.characters(); track char.id) {
                          <div (click)="viewItem('character', char)"
                               class="item-card">
                              <strong class="item-title">{{ char.name }}</strong> 
                              <p class="item-desc">{{ char.description || 'Tidak ada deskripsi.' }}</p>
                          </div>
                      } @empty { <span class="empty-text">Belum ada karakter.</span> }
                  }
                  @case ('locations') {
                      @if (bookState.isLoadingLocations()) { <span class="loading-text">Loading...</span> }
                      @for (loc of bookState.locations(); track loc.id) {
                          <div (click)="viewItem('location', loc)"
                               class="item-card">
                              <strong class="item-title">{{ loc.name }}</strong> 
                              <p class="item-desc">{{ loc.description || 'Tidak ada deskripsi.' }}</p>
                          </div>
                      } @empty { <span class="empty-text">Belum ada lokasi.</span> }
                  }
                  @case ('events') {
                      @if (bookState.isLoadingPlotEvents()) { <span class="loading-text">Loading...</span> }
                      @for (event of bookState.plotEvents(); track event.id) {
                          <div (click)="viewItem('event', event)"
                               class="item-card">
                              <strong class="item-title">{{ event.order }}. {{ event.title }}</strong>
                              <p class="item-desc">{{ event.summary || 'Tidak ada ringkasan.' }}</p>
                          </div>
                      } @empty { <span class="empty-text">Belum ada event.</span> }
                  }
              }
            </div>
          </div>
        
        } @else {
          <div class="space-y-4">
            @switch (viewingItem().type) {
              
              @case ('character') {
                @if (viewingItem().item; as char) {
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ char.name }}</h3>
                    <h4 class="detail-label">Deskripsi</h4>
                    <p class="detail-text">{{ char.description || 'Tidak ada deskripsi.' }}</p>

                    @if (char.relationships && char.relationships.length > 0) {
                      <h4 class="detail-label mt-4">Hubungan</h4>
                      <div class="space-y-2">
                        @for (rel of char.relationships; track rel.targetId) {
                          @if (bookState.characterMap().get(rel.targetId); as targetChar) {
                            <div class="bg-gray-100 dark:bg-gray-700/80 p-2 rounded-md">
                              <span class="font-semibold text-gray-800 dark:text-gray-200">{{ targetChar.name }}</span>
                              <span class="text-gray-600 dark:text-gray-400"> — {{ rel.type }}</span>
                            </div>
                          }
                        }
                      </div>
                    }
                  </div>
                }
              }

              @case ('location') {
                @if (viewingItem().item; as loc) {
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ loc.name }}</h3>
                    <h4 class="detail-label">Deskripsi</h4>
                    <p class="detail-text">{{ loc.description || 'Tidak ada deskripsi.' }}</p>
                  </div>
                }
              }

              @case ('event') {
                @if (viewingItem().item; as event) {
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ event.title }}</h3>
                    <h4 class="detail-label">Ringkasan</h4>
                    <p class="detail-text">{{ event.summary || 'Tidak ada ringkasan.' }}</p>

                    <h4 class="detail-label mt-4">Lokasi</h4>
                    @if (getLocationName(event.locationId); as locName) {
                      <p class="detail-text-simple">{{ locName }}</p>
                    } @else {
                      <p class="italic text-sm text-gray-500">Tidak ada lokasi spesifik.</p>
                    }

                    <h4 class="detail-label mt-4">Karakter Terlibat</h4>
                    @if (getCharacterNames(event.characterIds); as charNames) {
                      @if (charNames.length > 0) {
                        <ul class="list-disc list-inside space-y-1 pl-2">
                          @for (name of charNames; track name) {
                            <li class="detail-text-simple">{{ name }}</li>
                          }
                        </ul>
                      } @else {
                        <p class="italic text-sm text-gray-500">Tidak ada karakter terlibat.</p>
                      }
                    }
                  </div>
                }
              }
            }
          </div>
        } 
      </div>
    </div>
  `,
  styles: [`
    .item-card {
      @apply bg-gray-100 dark:bg-gray-700/80 p-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors;
    }
    .item-title {
      @apply text-gray-900 dark:text-white font-semibold;
    }
    .item-desc {
      @apply text-xs text-gray-600 dark:text-gray-400 truncate;
    }
    .loading-text, .empty-text {
      @apply text-gray-500 dark:text-gray-500 text-sm text-center py-4 block;
    }
    .detail-label {
      @apply text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2;
    }
    .detail-text {
      @apply text-gray-700 dark:text-gray-300 whitespace-pre-wrap;
    }
    .detail-text-simple {
      @apply text-gray-700 dark:text-gray-300;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldDetailComponent {
  public bookState = inject(CurrentBookStateService);
  
  tabs = [
    { key: 'characters', label: 'Characters' },
    { key: 'locations', label: 'Locations' },
    { key: 'events', label: 'Events' },
  ];
  
  activeTab = signal('characters');
  
  // --- STATE BARU UNTUK TAMPILAN DETAIL ---
  viewingItem = signal<ViewItem | null>(null);
  
  constructor() {
    // Efek untuk memuat data saat buku berubah (tetap sama)
    effect(() => {
        const bookId = this.bookState.currentBookId();
        if (bookId !== null) {
            this.bookState.loadCharacters(bookId);
            this.bookState.loadLocations(bookId);
            this.bookState.loadPlotEvents(bookId);
        }
    });
  }

  // --- FUNGSI BARU UNTUK MENGATUR TAMPILAN ---
  viewItem(type: 'character', item: ICharacter): void;
  viewItem(type: 'location', item: ILocation): void;
  viewItem(type: 'event', item: IPlotEvent): void;
  viewItem(type: any, item: any): void {
    this.viewingItem.set({ type, item });
  }

  // --- Helper (dicuplik dari modal) ---
  getLocationName(locationId: number | null): string | undefined {
    if (locationId === null) return undefined;
    return this.bookState.locationNameMap().get(locationId);
  }

  getCharacterNames(characterIds: number[]): string[] {
    if (!characterIds || characterIds.length === 0) return [];
    const charMap = this.bookState.characterMap();
    return characterIds
      .map(id => charMap.get(id)?.name)
      .filter((name): name is string => !!name);
  }
}
