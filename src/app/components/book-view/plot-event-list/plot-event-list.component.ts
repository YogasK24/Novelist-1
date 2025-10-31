// src/app/components/book-view/plot-event-list/plot-event-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CdkDragDrop, DragDropModule, moveItemInArray, CdkDropList } from '@angular/cdk/drag-drop';
import { CurrentBookStateService } from '../../../state/current-book-state.service'; 
import type { IPlotEvent } from '../../../../types/data';
import { AddPlotEventModalComponent } from '../add-plot-event-modal/add-plot-event-modal.component';
// Import baru untuk modal detail
import { PlotEventDetailModalComponent } from '../plot-event-detail-modal/plot-event-detail-modal.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmationService } from '../../../state/confirmation.service';

@Component({
  selector: 'app-plot-event-list',
  standalone: true,
  imports: [CommonModule, AddPlotEventModalComponent, DragDropModule, PlotEventDetailModalComponent, IconComponent], // <-- Tambahkan DragDropModule dan PlotEventDetailModalComponent
  template: `
    <div>
      <button 
        (click)="openAddModal()"
        class="mb-6 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-900">
        + Add Plot Event
      </button>

      @if (bookState.isLoadingPlotEvents() || isReordering()) {
        <div class="flex justify-center items-center py-6"> 
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-400 dark:border-accent-600"></div> 
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
                  class="relative mb-6 group transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-accent-500 rounded-lg"
                  [class.opacity-50]="isReordering()"
                  aria-grabbed="false"
                  [attr.aria-label]="'Plot Event ' + event.order + ': ' + event.title + '. Press up/down arrows to reorder.'">

                  <!-- Timeline Node (titik di garis) -->
                  <div class="absolute -left-[calc(1rem+2px)] top-1 w-4 h-4 rounded-full bg-accent-500 dark:bg-accent-600 border-2 border-slate-50 dark:border-slate-900 group-hover:bg-accent-400 transition"></div>
                  
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
                            <app-icon name="solid-bars-3-20" class="w-5 h-5" />
                        </div>
                    </div>

                     <!-- Tags untuk relasi -->
                    <div class="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                       @if (event.locationId) {
                         <div class="flex items-center gap-1.5" title="Location">
                           <app-icon name="solid-map-pin-20" class="w-5 h-5 text-gray-500" />
                           <span>1 Location</span>
                         </div>
                       }
                       @if (event.characterIds && event.characterIds.length > 0) {
                           <div class="flex items-center gap-1.5" title="Characters">
                             <app-icon name="solid-users-20" class="w-5 h-5 text-gray-500" />
                             <span>{{ event.characterIds.length }} Characters</span>
                           </div>
                       }
                     </div>

                    <!-- Tombol Aksi terpisah di pojok -->
                    <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button [disabled]="isReordering()" (click)="openEditModal(event); $event.stopPropagation()" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1.5 bg-slate-100/80 dark:bg-slate-900/60 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Edit Event">
                            <app-icon name="solid-pencil-20" class="w-5 h-5" />
                        </button>
                        <button [disabled]="isReordering()" (click)="deletePlotEvent(event.id!, event.title); $event.stopPropagation()" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1.5 bg-slate-100/80 dark:bg-slate-900/60 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Delete Event">
                            <app-icon name="solid-trash-20" class="w-5 h-5" />
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
  private confirmationService = inject(ConfirmationService);
  
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
    this.confirmationService.requestConfirmation({
      message: `Yakin ingin menghapus event "${name}"?`,
      onConfirm: () => this.bookState.deletePlotEvent(id)
    });
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