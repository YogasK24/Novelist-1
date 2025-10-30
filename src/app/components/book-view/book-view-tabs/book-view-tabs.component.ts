// src/app/components/book-view/book-view-tabs/book-view-tabs.component.ts
import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Import BARU
import { CurrentBookStateService } from '../../../state/current-book-state.service';
// Import komponen list
import { CharacterListComponent } from '../character-list/character-list.component';
import { LocationListComponent } from '../location-list/location-list.component';
import { PlotEventListComponent } from '../plot-event-list/plot-event-list.component';
import { ChapterListComponent } from '../chapter-list/chapter-list.component';
import { ThemeListComponent } from '../theme-list/theme-list.component';
import { PropListComponent } from '../prop-list/prop-list.component';
import { CharacterMapComponent } from '../character-map/character-map.component'; 

@Component({
  selector: 'app-book-view-tabs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // <-- Daftarkan BARU
    CharacterListComponent,
    LocationListComponent,
    PlotEventListComponent,
    ChapterListComponent,
    ThemeListComponent,
    PropListComponent,
    CharacterMapComponent, 
  ],
  template: `
    <div>
      
      @if (activeTab !== 'connections') {
        <div class="mb-4 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" 
                 class="w-5 h-5 text-gray-400 dark:text-gray-500">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </div>
          
          <input
            type="text"
            [placeholder]="dynamicPlaceholder()"
            [ngModel]="bookState.contextualSearchTerm()"
            (ngModelChange)="bookState.setContextualSearchTerm($event)"
            class="w-full pl-10 pr-10 py-2 rounded-md 
                   bg-gray-100 dark:bg-gray-800 
                   text-gray-900 dark:text-gray-200
                   border border-gray-300 dark:border-gray-700
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />
          
          @if (bookState.contextualSearchTerm()) {
            <button (click)="bookState.clearContextualSearch()" 
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
            </button>
          }
        </div>
      }

      <div class="border-b border-gray-300 dark:border-gray-700 mb-6">
        <nav class="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          @for (tab of tabs; track tab.key) {
            <button 
              (click)="setActiveTab(tab.key)"
              [class.text-purple-600]="activeTab === tab.key"
              [class.dark:text-purple-400]="activeTab === tab.key"
              [class.border-purple-600]="activeTab === tab.key"
              [class.dark:border-purple-400]="activeTab === tab.key"
              
              [class.text-gray-600]="activeTab !== tab.key"
              [class.dark:text-gray-400]="activeTab !== tab.key"
              [class.border-transparent]="activeTab !== tab.key"
              
              class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm 
                     hover:text-gray-900 dark:hover:text-white 
                     hover:border-gray-400 dark:hover:border-gray-500 transition
                     focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-t-md"
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
  public bookState = inject(CurrentBookStateService);

  tabs = [
    { key: 'connections', label: 'Connections' },
    { key: 'characters', label: 'Characters' },
    { key: 'locations', label: 'Locations' },
    { key: 'chapters', label: 'Chapters' },
    { key: 'events', label: 'Events' },
    { key: 'themes', label: 'Themes' },
    { key: 'props', label: 'Props' },
  ];
  
  activeTab: string = 'connections';
  private loadedTabs = new Set<string>();

  // BARU: Placeholder Dinamis
  dynamicPlaceholder = computed(() => {
    switch(this.activeTab) {
      case 'characters':
        return `Cari di ${this.bookState.characters().length} karakter...`;
      case 'locations':
        return `Cari di ${this.bookState.locations().length} lokasi...`;
      case 'chapters':
        return `Cari di ${this.bookState.chapters().length} bab...`;
      case 'events':
        return `Cari di ${this.bookState.plotEvents().length} event...`;
      case 'themes':
        return `Cari di ${this.bookState.themes().length} tema...`;
      case 'props':
        return `Cari di ${this.bookState.props().length} properti...`;
      default:
        return 'Cari...';
    }
  });

  ngOnInit(): void {
    // Muat data untuk tab default saat komponen dibuat
    this.loadTabData(this.activeTab);
  }

  setActiveTab(key: string): void {
    this.activeTab = key;
    // BARU: Reset pencarian setiap kali berpindah tab
    this.bookState.clearContextualSearch();
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