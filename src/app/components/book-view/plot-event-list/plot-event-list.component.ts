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
        class="mb-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150">
        + Tambah Event Plot
      </button>

      @if (bookState.isLoadingChildren().plotEvents || isReordering()) {
        <div class="flex justify-center items-center py-6"> 
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 dark:border-purple-600"></div> 
          @if (isReordering()) {
             <span class="ml-3 text-slate-400 dark:text-slate-500">Menyimpan urutan...</span>
          }
        </div>
      } @else if (bookState.plotEvents(); as plotEvents) {
         @if (plotEvents.length > 0) {
            <!-- Timeline Container -->
            <div 
              cdkDropList 
              [cdkDropListDisabled]="isReordering()"
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
                  class="relative mb-6 group transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
                  [class.opacity-50]="isReordering()"
                  aria-grabbed="false"
                  [attr.aria-label]="'Plot Event ' + event.order + ': ' + event.title + '. Tekan panah atas/bawah untuk menyusun ulang.'">

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
                                {{ (event.summary || 'Tidak ada ringkasan.').slice(0, 120) }}{{ (event.summary?.length || 0) > 120 ? '...' : '' }}
                            </p>
                        </div>
                        
                        <div cdkDragHandle class="p-2 -mr-2 text-slate-500 cursor-grab opacity-50 group-hover:opacity-100 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                               <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </div>
                    </div>

                     <!-- Tags untuk relasi -->
                    <div class="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                       @if (event.locationId) {
                         <div class="flex items-center gap-1.5" title="Lokasi">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" /></svg>
                           <span>1 Lokasi</span>
                         </div>
                       }
                       @if (event.characterIds && event.characterIds.length > 0) {
                           <div class="flex items-center gap-1.5" title="Karakter">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 dark:text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                             <span>{{ event.characterIds.length }} Karakter</span>
                           </div>
                       }
                     </div>

                    <!-- Tombol Aksi terpisah di pojok -->
                    <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button [disabled]="isReordering()" (click)="openEditModal(event); $event.stopPropagation()" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1.5 bg-slate-100/60 dark:bg-slate-700/60 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Edit Event">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button [disabled]="isReordering()" (click)="deletePlotEvent(event.id!, event.title); $event.stopPropagation()" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1.5 bg-slate-100/60 dark:bg-slate-700/60 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Hapus Event">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>

                  </div>
                </div>
              }
            </div>
         } @else {
           <p class="text-center text-slate-500 py-6">Belum ada event plot. Klik tombol di atas untuk membangun timeline ceritamu!</p>
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
    if (window.confirm(`Yakin ingin menghapus event "${name}"?`)) {
      this.bookState.deletePlotEvent(id).catch(err => console.error("Gagal menghapus:", err));
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
      if (this.isReordering()) return;

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
          event.preventDefault(); // Mencegah scrolling halaman
          
          // Simulasikan drop event
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

          // Pertahankan fokus pada item yang baru dipindahkan
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
    if (this.isReordering()) return; // Cegah double drop

    const currentEvents = [...this.bookState.plotEvents()];
    
    moveItemInArray(currentEvents, event.previousIndex, event.currentIndex);

    const reorderedEvents = currentEvents.map((item, index) => ({
      ...item,
      order: index + 1 // Recalculate order based on new array position
    }));
    
    this.isReordering.set(true); // <-- SET LOADING TRUE

    this.bookState.reorderPlotEvents(reorderedEvents)
        .catch(err => {
            console.error("Gagal menyimpan urutan event:", err);
        })
        .finally(() => {
            this.isReordering.set(false); // <-- SET LOADING FALSE
        });
  }
}