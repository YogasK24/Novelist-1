// src/app/components/book-view/plot-event-detail-modal/plot-event-detail-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { IPlotEvent } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';

@Component({
  selector: 'app-plot-event-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" aria-modal="true" role="dialog">
      <div 
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()">

        @if (event(); as currentEvent) {
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-white">
              {{ currentEvent.title }}
            </h2>
            <button (click)="close()" class="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
          </div>

          <div class="max-h-[70vh] overflow-y-auto pr-2">
              <p class="text-gray-300 whitespace-pre-wrap mb-6">
                {{ currentEvent.summary || 'Tidak ada ringkasan.' }}
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Lokasi -->
                <div>
                    <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Lokasi</h3>
                    @if (getLocationName(currentEvent.locationId); as locationName) {
                        <div class="flex items-center gap-2 bg-gray-700/50 p-3 rounded-md">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                             </svg>
                            <span class="text-white font-medium">{{ locationName }}</span>
                        </div>
                    } @else {
                        <p class="text-gray-400 italic">Tidak ada lokasi spesifik.</p>
                    }
                </div>
                
                <!-- Karakter Terlibat -->
                <div>
                    <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Karakter Terlibat</h3>
                    @if (getCharacterNames(currentEvent.characterIds); as charNames) {
                        @if (charNames.length > 0) {
                            <div class="space-y-2">
                                @for (name of charNames; track name) {
                                    <div class="flex items-center gap-2 bg-gray-700/50 p-2 rounded-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                           <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                        </svg>
                                        <span class="text-white">{{ name }}</span>
                                    </div>
                                }
                            </div>
                        } @else {
                             <p class="text-gray-400 italic">Tidak ada karakter yang terlibat.</p>
                        }
                    }
                </div>
              </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlotEventDetailModalComponent {
  show = input.required<boolean>();
  event = input<IPlotEvent | null>(null);
  closeModal = output<void>();

  public bookState = inject(CurrentBookStateService);

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

  close(): void {
    this.closeModal.emit();
  }
}
