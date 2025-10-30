// src/app/components/book-view/plot-event-list/plot-event-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CdkDragDrop, DragDropModule, moveItemInArray, CdkDropList } from '@angular/cdk/drag-drop';
import { CurrentBookStateService } from '../../../state/current-book-state.service'; 
import type { IPlotEvent } from '../../../../types/data';
import { AddPlotEventModalComponent } from '../add-plot-event-modal/add-plot-event-modal.component';
// Import baru untuk modal detail
import { PlotEventDetailModalComponent } from '../plot-event-detail-modal/plot-event-detail-modal.component';

@Component({
  selector: 'app-plot-event-list',
  standalone: true,
  imports: [CommonModule, AddPlotEventModalComponent, DragDropModule, PlotEventDetailModalComponent], // <-- Tambahkan DragDropModule dan PlotEventDetailModalComponent
  template: `
    <div>
      <button 
        (click)="openAddModal()"
        class="mb-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900">
        + Add Plot Event
      </button>

      @if (bookState.isLoadingPlotEvents() || isReordering()) {
        <div class="flex justify-center items-center py-6"> 
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 dark:border-purple-600"></div> 
          @if (isReordering()) {
             <span class="ml-3 text-slate-400 dark:text-slate-500">Saving order...</span>
          }
        </div>
      } @else if (bookState.filteredPlotEvents(); as plotEvents) {
         @if (plotEvents.length > 0) {
            <!-- Timeline Container -->
            <div 
              cdkDropList 
              [cdkDropListDisabled]="isReordering() || bookState.contextualSearchTerm().length > 0"
              (cdkDropListDropped)="onDrop($event)" 
              #plotEventList="cdkDropList" 
              class="relative pl-8 before:content-[''] before:absolute before:top-0 before:left-4 before:bottom-0 before:w-0.5 before:bg-slate-300 dark:before:bg-slate-700">
              
              @for (event of plotEvents; track event.id) {
                <!-- Timeline Event Item -->
                <div 
                  cdkDrag 
                  [cdkDragData]="event"
                  tabindex="0"
                  (keydown)="onMoveItem(event, $event)"
                  class="relative mb-6 group transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-purple-500 rounded-lg"
                  [class.opacity-50]="isReordering()"
                  aria-grabbed="false"
                  [attr.aria-label]="'Plot Event ' + event.order + ': ' + event.title + '. Press up/down arrows to reorder.'">

                  <!-- Timeline Node (titik di garis) -->
                  <div class="absolute -left-[calc(1rem+2px)] top-1 w-4 h-4 rounded-full bg-purple-500 dark:bg-purple-600 border-2 border-slate-50 dark:border-slate-900 group-hover:bg-purple-400 transition"></div>
                  
                  <!-- Timeline Content (card) -->
                  <div 
                    (click)="viewPlotEventDetails(event)"
                    class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all duration-200 cursor-pointer">
                    
                    <div class="flex justify-between items-start">
                        <div class="flex-grow">
                            <h4 class="font-bold text-slate-900 dark:text-white text-lg">{{ event.title }}</h4>
                            <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap break-words">
                                {{ (event.summary || 'No summary.').slice(0, 120) }}{{ (event.summary?.length || 0) > 120 ? '...' : '' }}
                            </p>
                        </div>
                        
                        <div cdkDragHandle class="p-2 -mr-2 text-slate-500 transition"
                             [class.cursor-grab]="!isReordering() && bookState.contextualSearchTerm().length === 0"
                             [class.cursor-not-allowed]="isReordering() || bookState.contextualSearchTerm().length > 0"
                             [class.opacity-50]="isReordering() || bookState.contextualSearchTerm().length > 0"
                             [class.group-hover:opacity-100]="!isReordering() && bookState.contextualSearchTerm().length === 0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                              <path fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    </div>

                     <!-- Tags untuk relasi -->
                    <div class="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                       @if (event.locationId) {
                         <div class="flex items-center gap-1.5" title="Location">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-500">
                             <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.22.655-.368.201-.115.406-.238.6-.371.192-.132.378-.272.553-.417l1.026-.859c.092-.076.183-.153.271-.231l.01-.01.004-.004c.06-.05.118-.1.173-.154l.023-.023a1.48 1.48 0 00.16-.165c.04-.044.078-.09.114-.138l.001-.001.001-.001c.11-.15.21-.308.302-.475l.003-.006a1.498 1.498 0 00.15-.31c.02-.05.038-.1.055-.154l.003-.008a1.5 1.5 0 00.044-.19c.01-.06.018-.12.024-.182l.002-.007a1.5 1.5 0 00.02-.204c.002-.07.004-.14.004-.21v-.002a7 7 0 00-14 0c0 .07.002.14.004.21v.002l.002.007c.006.06.013.12.023.182.006.05.013.1.02.15l.002.006.002.007c.01.06.02.12.03.18a1.5 1.5 0 00.045.19c.006.05.013.1.02.15l.002.006.004.008c.02.05.04.1.06.15l.003.004.008.008c.04.04.08.09.12.14l.002.002.003.003a1.48 1.48 0 00.16.165l.023.023c.05.05.11.1.17.15l.003.003.006.004c.09.08.18.15.27.23l.002.002 1.026.86c.17.14.36.28.55.41l.002.002c.19.13.39.25.6.37a7.22 7.22 0 00.65.37l.02.01.03.01a5.74 5.74 0 00.28.14l.017.008.007.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
                             <path d="M10 12.5a.5.5 0 01-.5-.5v-2a.5.5 0 011 0v2a.5.5 0 01-.5.5z" />
                           </svg>
                           <span>1 Location</span>
                         </div>
                       }
                       @if (event.characterIds && event.characterIds.length > 0) {
                           <div class="flex items-center gap-1.5" title="Characters">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-500">
                               <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 8a3 3 0 100-6 3 3 0 000 6zM1.066 16.59a1.5 1.5 0 012.15-1.793A10.953 10.953 0 008 16.5c.343 0 .681-.01 1.014-.03A1.5 1.5 0 0110.8 17.1a10.953 10.953 0 004.784-1.703 1.5 1.5 0 012.15 1.793A12.452 12.452 0 0110 18c-2.43 0-4.72-.667-6.617-1.84a1.5 1.5 0 01-2.317-.57zM14.5 11.5c.204 0 .4-.006.593-.018a1.5 1.5 0 011.628 1.87A10.953 10.953 0 0018 16.5c.343 0 .681-.01 1.014-.03a1.5 1.5 0 011.628 1.87A12.452 12.452 0 0114.5 18c-1.597 0-3.098-.42-4.42-1.155a1.5 1.5 0 01-.416-2.21 1.5 1.5 0 012.21-.416A10.906 10.906 0 0014.5 16.5c.204 0 .4-.006.593-.018a1.5 1.5 0 011.628 1.87A10.953 10.953 0 0018 16.5c.343 0 .681-.01 1.014-.03a1.5 1.5 0 011.628 1.87A12.452 12.452 0 0114.5 18c-2.43 0-4.72-.667-6.617-1.84a1.5 1.5 0 01-2.317-.57z" />
                             </svg>
                             <span>{{ event.characterIds.length }} Characters</span>
                           </div>
                       }
                     </div>

                    <!-- Tombol Aksi terpisah di pojok -->
                    <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button [disabled]="isReordering()" (click)="openEditModal(event); $event.stopPropagation()" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1.5 bg-slate-100/80 dark:bg-slate-900/60 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Edit Event">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                              <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                            </svg>
                        </button>
                        <button [disabled]="isReordering()" (click)="deletePlotEvent(event.id!, event.title); $event.stopPropagation()" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1.5 bg-slate-100/80 dark:bg-slate-900/60 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Delete Event">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                              <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.84 0a.75.75 0 01-1.5.06l-.3 7.5a.75.75 0 111.5-.06l.3-7.5z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>

                  </div>
                </div>
              }
            </div>
         } @else {
            @if (bookState.contextualSearchTerm()) {
                <p class="text-center text-slate-500 py-6">No events match your search.</p>
            } @else {
                <p class="text-center text-slate-500 py-6">No plot events yet. Click the button above to build your story timeline!</p>
            }
         }
      }

      <!-- Modal Tambah/Edit -->
      @if (showModal()) {
        <app-add-plot-event-modal
          [show]="showModal()" 
          [eventToEdit]="editingEvent()"
          (closeModal)="closeModal()">
        </app-add-plot-event-modal>
      }

      <!-- Modal Detail (Read-only) -->
      @if (showDetailModal()) {
        <app-plot-event-detail-modal
          [show]="showDetailModal()"
          [event]="viewingEvent()"
          (closeModal)="closeDetailModal()">
        </app-plot-event-detail-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlotEventListComponent {
  public bookState = inject(CurrentBookStateService); 
  
  @ViewChild('plotEventList') plotEventList!: CdkDropList<IPlotEvent[]>;
  
  // State untuk modal edit/tambah
  showModal = signal(false);
  editingEvent = signal<IPlotEvent | null>(null);

  // State BARU untuk modal detail
  showDetailModal = signal(false);
  viewingEvent = signal<IPlotEvent | null>(null);
  
  // State BARU: Reordering
  isReordering: WritableSignal<boolean> = signal(false);

  // --- Logika Modal Edit/Tambah (sudah ada) ---
  openAddModal(): void {
    this.editingEvent.set(null); 
    this.showModal.set(true);
  }

  openEditModal(event: IPlotEvent): void {
    this.editingEvent.set(event); 
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  deletePlotEvent(id: number, name: string): void {
    if (window.confirm(`Are you sure you want to delete the event "${name}"?`)) {
      this.bookState.deletePlotEvent(id);
    }
  }

  // --- Logika Modal Detail (BARU) ---
  viewPlotEventDetails(event: IPlotEvent): void {
    this.viewingEvent.set(event);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
  }

  onMoveItem(eventData: IPlotEvent, event: KeyboardEvent): void {
      if (this.isReordering() || this.bookState.contextualSearchTerm().length > 0) return;

      const direction = event.key;
      const events = this.bookState.plotEvents();
      const currentIndex = events.findIndex(e => e.id === eventData.id);
      
      let newIndex = -1;

      if (direction === 'ArrowUp' && currentIndex > 0) {
          newIndex = currentIndex - 1;
      } else if (direction === 'ArrowDown' && currentIndex < events.length - 1) {
          newIndex = currentIndex + 1;
      }

      if (newIndex !== -1) {
          event.preventDefault(); // Prevent page scrolling
          
          // Simulate drop event
          const fakeDropEvent: CdkDragDrop<IPlotEvent[]> = {
              currentIndex: newIndex,
              previousIndex: currentIndex,
              container: this.plotEventList,
              previousContainer: this.plotEventList,
              item: null as any,
              isPointerOverContainer: true,
              distance: { x: 0, y: 0 }
          } as CdkDragDrop<IPlotEvent[]>;

          this.onDrop(fakeDropEvent);

          // Keep focus on the newly moved item
          setTimeout(() => {
              const items = this.plotEventList.element.nativeElement.querySelectorAll('[cdkdrag]');
              if (items[newIndex]) {
                  (items[newIndex] as HTMLElement).focus();
              }
          }, 50);
      }
  }

  // --- Logika Drag and Drop (sudah ada) ---
  onDrop(event: CdkDragDrop<IPlotEvent[]>): void {
    if (this.isReordering()) return; // Prevent double drop

    const currentEvents = [...this.bookState.plotEvents()];
    
    moveItemInArray(currentEvents, event.previousIndex, event.currentIndex);

    const reorderedEvents = currentEvents.map((item, index) => ({
      ...item,
      order: index + 1 // Recalculate order based on new array position
    }));
    
    this.isReordering.set(true); // <-- SET LOADING TRUE

    this.bookState.reorderPlotEvents(reorderedEvents)
        .catch(err => {
            console.error("Failed to save event order:", err);
        })
        .finally(() => {
            this.isReordering.set(false); // <-- SET LOADING FALSE
        });
  }
}