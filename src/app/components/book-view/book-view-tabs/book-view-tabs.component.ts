// src/app/components/book-view/book-view-tabs/book-view-tabs.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
// Import komponen list yang akan kita buat
import { CharacterListComponent } from '../character-list/character-list.component';
import { LocationListComponent } from '../location-list/location-list.component';
import { PlotEventListComponent } from '../plot-event-list/plot-event-list.component';
import { ChapterListComponent } from '../chapter-list/chapter-list.component';
import { ThemeListComponent } from '../theme-list/theme-list.component';
import { PropListComponent } from '../prop-list/prop-list.component';
import { CharacterMapComponent } from '../character-map/character-map.component'; // <-- Impor baru

@Component({
  selector: 'app-book-view-tabs',
  standalone: true,
  imports: [
    CommonModule,
    CharacterListComponent,
    LocationListComponent,
    PlotEventListComponent,
    ChapterListComponent,
    ThemeListComponent,
    PropListComponent,
    CharacterMapComponent, // <-- Daftarkan komponen Map
  ],
  template: `
    <div>
      <!-- Navigasi Tab -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav class="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          @for (tab of tabs; track tab.key) {
            <button 
              (click)="setActiveTab(tab.key)"
              [class.text-purple-600]="activeTab === tab.key"
              [class.dark:text-purple-400]="activeTab === tab.key"
              [class.border-purple-500]="activeTab === tab.key"
              [class.dark:border-purple-400]="activeTab === tab.key"
              [class.text-gray-500]="activeTab !== tab.key"
              [class.dark:text-gray-400]="activeTab !== tab.key"
              [class.border-transparent]="activeTab !== tab.key"
              class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm hover:text-gray-700 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition"
            >
              {{ tab.label }}
            </button>
          }
        </nav>
      </div>

      <!-- Konten Tab -->
      @switch (activeTab) {
         @case ('connections') { <app-character-map></app-character-map> }
         @case ('characters') { <app-character-list></app-character-list> }
         @case ('locations') { <app-location-list></app-location-list> }
         @case ('chapters') { <app-chapter-list-tab></app-chapter-list-tab> }
         @case ('events') { <app-plot-event-list></app-plot-event-list> }
         @case ('themes') { <app-theme-list></app-theme-list> }
         @case ('props') { <app-prop-list></app-prop-list> }
         @default { <div class="p-4 text-gray-500">Pilih tab</div> }
      }
    </div>
  `
})
export class BookViewTabsComponent implements OnInit {
  private bookState = inject(CurrentBookStateService);

  tabs = [
    { key: 'connections', label: 'Connections' },
    { key: 'characters', label: 'Characters' },
    { key: 'locations', label: 'Locations' },
    { key: 'chapters', label: 'Chapters' },
    { key: 'events', label: 'Events' },
    { key: 'themes', label: 'Themes' },
    { key: 'props', label: 'Props' },
  ];
  // Default tab aktif
  activeTab: string = 'connections';
  private loadedTabs = new Set<string>();

  ngOnInit(): void {
    // Muat data untuk tab default saat komponen dibuat
    this.loadTabData(this.activeTab);
  }

  setActiveTab(key: string): void {
    this.activeTab = key;
    this.loadTabData(key);
  }

  private loadTabData(key: string): void {
    const bookId = this.bookState.currentBookId();
    if (bookId === null || this.loadedTabs.has(key)) {
      return; // Sudah dimuat atau belum ada ID buku
    }

    // Panggil action pemuatan spesifik berdasarkan tab
    switch (key) {
      case 'connections':
        this.bookState.loadCharacters(bookId);
        break;
      case 'characters':
        this.bookState.loadCharacters(bookId);
        break;
      case 'locations':
        this.bookState.loadLocations(bookId);
        break;
      case 'chapters':
        this.bookState.loadChapters(bookId);
        // Chapter list membutuhkan data karakter untuk menampilkan nama
        this.bookState.loadCharacters(bookId);
        break;
      case 'events':
        // Detail event membutuhkan data karakter dan lokasi
        this.bookState.loadPlotEvents(bookId);
        this.bookState.loadCharacters(bookId);
        this.bookState.loadLocations(bookId);
        break;
      case 'themes':
        this.bookState.loadThemes(bookId);
        break;
      case 'props':
        this.bookState.loadProps(bookId);
        break;
    }

    this.loadedTabs.add(key); // Tandai sebagai sudah dimuat
  }
}
