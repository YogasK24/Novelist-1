// src/app/components/book-view/book-view-tabs/book-view-tabs.component.ts
import { Component, inject, OnInit, computed, input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { IconComponent } from '../../shared/icon/icon.component';
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
    IconComponent,
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
            <app-icon name="solid-magnifying-glass-20" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
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
                   focus:outline-none focus:ring-2 focus:ring-accent-600 dark:focus:ring-accent-500"
          />
          
          @if (bookState.contextualSearchTerm()) {
            <button (click)="bookState.clearContextualSearch()" 
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <app-icon name="solid-x-circle-20" class="w-5 h-5" />
            </button>
          }
        </div>
      }

      <div class="border-b border-gray-300 dark:border-gray-700 mb-6"> 
        <nav class="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          @for (tab of tabs; track tab.key) {
            <button 
              (click)="setActiveTab(tab.key)"
              [class.text-accent-600]="activeTab === tab.key"
              [class.dark:text-accent-400]="activeTab === tab.key"
              [class.border-accent-600]="activeTab === tab.key"
              [class.dark:border-accent-400]="activeTab === tab.key"
              
              [class.text-gray-600]="activeTab !== tab.key"
              [class.dark:text-gray-400]="activeTab !== tab.key"
              [class.border-transparent]="activeTab !== tab.key"
              
              class="whitespace-nowrap py-3 px-3 flex items-center gap-2 
                     border-b-2 font-medium text-sm 
                     hover:text-gray-900 dark:hover:text-white 
                     hover:border-gray-400 dark:hover:border-gray-500 transition"
            >
              <app-icon [name]="tab.iconName" class="w-5 h-5" />
              
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
         @case ('characters') { <app-character-list [entityToEditId]="getEntityIdForTab('characters')" (editHandled)="onEditHandled()"></app-character-list> }
         @case ('locations') { <app-location-list [entityToEditId]="getEntityIdForTab('locations')" (editHandled)="onEditHandled()"></app-location-list> }
         @case ('chapters') { <app-chapter-list-tab [entityToEditId]="getEntityIdForTab('chapters')" (editHandled)="onEditHandled()"></app-chapter-list-tab> }
         @case ('events') { <app-plot-event-list [entityToEditId]="getEntityIdForTab('events')" (editHandled)="onEditHandled()"></app-plot-event-list> }
         @case ('themes') { <app-theme-list [entityToEditId]="getEntityIdForTab('themes')" (editHandled)="onEditHandled()"></app-theme-list> }
         @case ('props') { <app-prop-list [entityToEditId]="getEntityIdForTab('props')" (editHandled)="onEditHandled()"></app-prop-list> }
         @default { <div class="p-4 text-gray-500">Pilih tab</div> }
      }
    </div>
  `
})
export class BookViewTabsComponent implements OnInit {
  public bookState = inject(CurrentBookStateService);
  private router = inject(Router);

  // --- NEW: Input for initial action ---
  initialAction = input<{ openTab?: string; editId?: number } | null>(null);
  private actionToProcess = signal<{ openTab?: string; editId?: number } | null>(null);

  tabs = [
    { key: 'connections', label: 'Connections', iconName: 'solid-globe-alt-20' }, 
    { key: 'characters', label: 'Characters', iconName: 'solid-users-20' }, 
    { key: 'locations', label: 'Locations', iconName: 'solid-map-pin-20' }, 
    { key: 'chapters', label: 'Chapters', iconName: 'solid-book-open-20' }, 
    { key: 'events', label: 'Events', iconName: 'solid-bars-4-20' }, 
    { key: 'themes', label: 'Themes', iconName: 'solid-sparkles-20' }, 
    { key: 'props', label: 'Props', iconName: 'solid-puzzle-piece-20' } 
  ];
  
  activeTab: string = 'connections';
  private loadedTabs = new Set<string>();

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

  constructor() {
    // Effect to process the initial action once
    effect(() => {
        const action = this.initialAction();
        if (action) {
            this.actionToProcess.set(action);
            if (action.openTab && this.tabs.some(t => t.key === action.openTab)) {
                this.setActiveTab(action.openTab);
            }
        }
    });
  }

  ngOnInit(): void {
    if (!this.actionToProcess()) {
        this.loadTabData(this.activeTab);
    }
  }

  // --- NEW: Method to handle when child component has processed the edit action ---
  onEditHandled(): void {
    this.actionToProcess.set(null);
    // Hapus query params dari URL untuk mencegah modal terbuka lagi saat refresh
    this.router.navigate([], { queryParams: {} });
  }

  // --- NEW: Helper to pass the correct ID to the correct tab ---
  getEntityIdForTab(tabKey: string): number | undefined {
    const action = this.actionToProcess();
    return action?.openTab === tabKey ? action.editId : undefined;
  }

  setActiveTab(key: string): void {
    this.activeTab = key;
    this.bookState.clearContextualSearch();
    this.loadTabData(key);
    
    if (key !== 'connections') {
      setTimeout(() => { 
        const inputEl = document.querySelector<HTMLInputElement>('#contextualSearchInput');
        inputEl?.focus();
      }, 50);
    }
  }

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
      return; 
    }
    
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
        this.bookState.loadCharacters(bookId);
        break;
      case 'events':
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

    this.loadedTabs.add(key); 
  }
}