// src/app/components/world-detail/world-detail.component.ts
import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentBookStateService } from '../../state/current-book-state.service';

@Component({
  selector: 'app-world-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col">
      <h2 class="text-lg font-bold mb-4 text-slate-800 dark:text-white flex-shrink-0">World Notes</h2>
      
      <div class="border-b border-slate-200 dark:border-slate-700 mb-4 flex-shrink-0">
        <nav class="flex space-x-4" aria-label="Tabs">
          @for (tab of tabs; track tab.key) {
            <button 
              (click)="activeTab.set(tab.key)"
              [class.text-purple-600]="activeTab() === tab.key"
              [class.dark:text-purple-400]="activeTab() === tab.key"
              [class.border-purple-500]="activeTab() === tab.key"
              [class.dark:border-purple-400]="activeTab() === tab.key"
              [class.text-slate-500]="activeTab() !== tab.key"
              [class.dark:text-slate-400]="activeTab() !== tab.key"
              [class.border-transparent]="activeTab() !== tab.key"
              class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm hover:text-slate-700 dark:hover:text-white transition"
            >
              {{ tab.label }}
            </button>
          }
        </nav>
      </div>
      
      <div class="flex-grow overflow-y-auto space-y-4 pr-2">
        @switch (activeTab()) {
            @case ('characters') {
                @if (bookState.isLoadingChildren().characters) {
                     <p class="text-slate-500 text-sm text-center py-4">Loading characters...</p>
                } @else if (bookState.characters(); as characters) {
                    @if (characters.length > 0) {
                        <div class="space-y-2">
                            @for (char of characters; track char.id) {
                                <div class="bg-slate-100 dark:bg-slate-700/80 p-2 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer">
                                    <strong class="text-slate-800 dark:text-white">{{ char.name }}</strong> 
                                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ char.description || 'No description.' }}</p>
                                </div>
                            }
                        </div>
                    } @else {
                        <p class="text-slate-500 text-sm text-center py-4">No characters added yet.</p>
                    }
                }
            }
            @case ('locations') {
                @if (bookState.isLoadingChildren().locations) {
                     <p class="text-slate-500 text-sm text-center py-4">Loading locations...</p>
                } @else if (bookState.locations(); as locations) {
                    @if (locations.length > 0) {
                        <div class="space-y-2">
                            @for (loc of locations; track loc.id) {
                                <div class="bg-slate-100 dark:bg-slate-700/80 p-2 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer">
                                    <strong class="text-slate-800 dark:text-white">{{ loc.name }}</strong> 
                                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ loc.description || 'No description.' }}</p>
                                </div>
                            }
                        </div>
                    } @else {
                         <p class="text-slate-500 text-sm text-center py-4">No locations added yet.</p>
                    }
                }
            }
            @case ('events') {
                @if (bookState.isLoadingChildren().plotEvents) {
                     <p class="text-slate-500 text-sm text-center py-4">Loading events...</p>
                } @else if (bookState.plotEvents(); as events) {
                     @if (events.length > 0) {
                        <div class="space-y-2">
                            @for (event of events; track event.id) {
                                <div class="bg-slate-100 dark:bg-slate-700/80 p-2 rounded text-sm hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer">
                                    <strong class="text-slate-800 dark:text-white">{{ event.order }}. {{ event.title }}</strong> 
                                </div>
                            }
                        </div>
                     } @else {
                        <p class="text-slate-500 text-sm text-center py-4">No events added yet.</p>
                     }
                }
            }
        }
      </div>
    </div>
  `,
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
  
  constructor() {
    effect(() => {
        const bookId = this.bookState.currentBookId();
        if (bookId !== null) {
            this.bookState.loadCharacters(bookId);
            this.bookState.loadLocations(bookId);
            this.bookState.loadPlotEvents(bookId);
        }
    });
  }
}