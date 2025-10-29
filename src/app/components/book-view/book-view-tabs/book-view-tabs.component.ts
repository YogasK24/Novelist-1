// src/app/components/book-view/book-view-tabs/book-view-tabs.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import komponen list yang akan kita buat
import { CharacterListComponent } from '../character-list/character-list.component';
import { LocationListComponent } from '../location-list/location-list.component';
import { PlotEventListComponent } from '../plot-event-list/plot-event-list.component';

@Component({
  selector: 'app-book-view-tabs',
  standalone: true,
  imports: [
    CommonModule,
    CharacterListComponent, // Daftarkan komponen list
    LocationListComponent,
    PlotEventListComponent,
  ],
  template: `
    <div>
      <!-- Navigasi Tab -->
      <div class="border-b border-gray-700 mb-4">
        <nav class="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          @for (tab of tabs; track tab.key) {
            <button 
              (click)="activeTab = tab.key"
              [class.text-purple-400]="activeTab === tab.key"
              [class.border-purple-400]="activeTab === tab.key"
              [class.text-gray-400]="activeTab !== tab.key"
              [class.border-transparent]="activeTab !== tab.key"
              class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm hover:text-white hover:border-gray-500 transition"
            >
              {{ tab.label }}
            </button>
          }
        </nav>
      </div>

      <!-- Konten Tab -->
      @switch (activeTab) {
         @case ('characters') { <app-character-list></app-character-list> }
         @case ('locations') { <app-location-list></app-location-list> }
         @case ('events') { <app-plot-event-list></app-plot-event-list> }
         @case ('themes') { <div class="p-4 text-gray-500">Konten Themes akan datang...</div> }
         @case ('props') { <div class="p-4 text-gray-500">Konten Props akan datang...</div> }
         @default { <div class="p-4 text-gray-500">Pilih tab</div> }
      }
    </div>
  `
})
export class BookViewTabsComponent {
  tabs = [
    { key: 'themes', label: 'Themes' },
    { key: 'events', label: 'Events' },
    { key: 'characters', label: 'Characters' },
    { key: 'locations', label: 'Locations' },
    { key: 'props', label: 'Props' },
  ];
  // Default tab aktif
  activeTab: string = 'characters'; 
}