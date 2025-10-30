// src/app/components/book-view/book-view-tabs/book-view-tabs.component.ts
import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
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
    FormsModule, 
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
            id="contextualSearchInput" 
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
              
              class="whitespace-nowrap py-3 px-3 flex items-center gap-2 border-b-2 font-medium text-sm 
                     hover:text-gray-900 dark:hover:text-white 
                     hover:border-gray-400 dark:hover:border-gray-500 transition
                     focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                 <path fill-rule="evenodd" [attr.d]="tab.iconPath" clip-rule="evenodd" />
              </svg>
              
              <span>{{ tab.label }}</span>
              
              @if (tab.key !== 'connections') {
                <span class="text-xs font-normal text-gray-400 dark:text-gray-500">
                   ({{ getItemCount(tab.key) }})
                </span>
              }
            </button>
          }
        </nav>
      </div>

      @switch (activeTab) {
         @case ('connections') { <app-character-map></app-character-map> }
         @case ('characters') { <app-character-list></app-character-list> }
         @case ('locations') { <app-location-list></app-location-list> }
         @case ('chapters') { <app-chapter-list-tab></app-chapter-list-tab> }
         @case ('events') { <app-plot-event-list></app-plot-event-list> }
         @case ('themes') { <app-theme-list></app-theme-list> }
         @case ('props') { <app-prop-list></app-prop-list> }
         @default { <div class="p-4 text-gray-500">Select a tab</div> }
      }
    </div>
  `
})
export class BookViewTabsComponent implements OnInit {
  public bookState = inject(CurrentBookStateService);

  // BARU: Tambahkan iconPath (SVG 'd' attribute)
  tabs = [
    { key: 'connections', label: 'Connections', iconPath: 'M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5' }, // Globe Alt
    { key: 'characters', label: 'Characters', iconPath: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' }, // Users
    { key: 'locations', label: 'Locations', iconPath: 'M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.22.655-.368.201-.115.406-.238.6-.371.192-.132.378-.272.553-.417l1.026-.859c.092-.076.183-.153.271-.231l.01-.01.004-.004c.06-.05.118-.1.173-.154l.023-.023a1.48 1.48 0 00.16-.165c.04-.044.078-.09.114-.138l.001-.001.001-.001c.11-.15.21-.308.302-.475l.003-.006a1.498 1.498 0 00.15-.31c.02-.05.038-.1.055-.154l.003-.008a1.5 1.5 0 00.044-.19c.01-.06.018-.12.024-.182l.002-.007a1.5 1.5 0 00.02-.204c.002-.07.004-.14.004-.21v-.002a7 7 0 00-14 0c0 .07.002.14.004.21v.002l.002.007c.006.06.013.12.023.182.006.05.013.1.02.15l.002.006.002.007c.01.06.02.12.03.18a1.5 1.5 0 00.045.19c.006.05.013.1.02.15l.002.006.004.008c.02.05.04.1.06.15l.003.004.008.008c.04.04.08.09.12.14l.002.002.003.003a1.48 1.48 0 00.16.165l.023.023c.05.05.11.1.17.15l.003.003.006.004c.09.08.18.15.27.23l.002.002 1.026.86c.17.14.36.28.55.41l.002.002c.19.13.39.25.6.37a7.22 7.22 0 00.65.37l.02.01.03.01a5.74 5.74 0 00.28.14l.017.008.007.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z' }, // Map Pin
    { key: 'chapters', label: 'Chapters', iconPath: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' }, // Book Open
    { key: 'events', label: 'Events', iconPath: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.125 1.125 0 010 2.25H5.625a1.125 1.125 0 010-2.25z' }, // Bars 4
    { key: 'themes', label: 'Themes', iconPath: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.333.184.74.276 1.15.276h.288c.339 0 .621.279.621.621v2.14c0 .342-.282.621-.621.621h-.288c-.41 0-.817.092-1.15.276a1.125 1.125 0 01-.646.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281a1.125 1.125 0 01-.646-.87c-.333-.184-.74-.276-1.15-.276H5.378c-.34 0-.621-.279-.621-.621v-2.14c0 .342.282.621.621.621h.288c.41 0 .817-.092 1.15-.276.333-.184.583-.496.646-.87l.213-1.28zM15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' }, // Sparkles
    { key: 'props', label: 'Props', iconPath: 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.815m7.381-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.314.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.314m-2.448 2.448a15.09 15.09 0 00-2.448 2.448 14.9 14.9 0 00.06.314m2.448-2.448L9.63 8.41m3.82 3.82a14.927 14.927 0 01-2.58 5.841M9.63 8.41a14.936 14.936 0 01-5.84-2.581' } // Puzzle Piece
  ];
  
  activeTab: string = 'connections';
  private loadedTabs = new Set<string>();

  // BARU: Placeholder Dinamis (tetap ada)
  dynamicPlaceholder = computed(() => {
    switch(this.activeTab) {
      case 'characters':
        return `Search in ${this.bookState.characters().length} characters...`;
      case 'locations':
        return `Search in ${this.bookState.locations().length} locations...`;
      case 'chapters':
        return `Search in ${this.bookState.chapters().length} chapters...`;
      case 'events':
        return `Search in ${this.bookState.plotEvents().length} events...`;
      case 'themes':
        return `Search in ${this.bookState.themes().length} themes...`;
      case 'props':
        return `Search in ${this.bookState.props().length} props...`;
      default:
        return 'Search...';
    }
  });

  ngOnInit(): void {
    // Load data for the default tab when the component is created
    this.loadTabData(this.activeTab);
  }

  setActiveTab(key: string): void {
    this.activeTab = key;
    this.bookState.clearContextualSearch();
    this.loadTabData(key);
  }

  // NEW: Helper to get item count
  getItemCount(key: string): number {
    switch(key) {
      case 'characters': return this.bookState.filteredCharacters().length;
      case 'locations': return this.bookState.filteredLocations().length;
      case 'chapters': return this.bookState.filteredChapters().length;
      case 'events': return this.bookState.filteredPlotEvents().length;
      case 'themes': return this.bookState.filteredThemes().length;
      case 'props': return this.bookState.filteredProps().length;
      default: return 0;
    }
  }

  private loadTabData(key: string): void {
    const bookId = this.bookState.currentBookId();
    if (bookId === null || this.loadedTabs.has(key)) {
      return; // Already loaded or no book ID yet
    }

    // Call specific loading action based on the tab
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
        // Chapter list needs character data to display names
        this.bookState.loadCharacters(bookId);
        break;
      case 'events':
        // Event details need character and location data
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

    this.loadedTabs.add(key); // Mark as loaded
  }
}