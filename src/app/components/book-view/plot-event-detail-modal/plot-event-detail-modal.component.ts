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
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" aria-modal="true" role="dialog">
      <div 
        class="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()">

        @if (event(); as currentEvent) {
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-gray-200">
              {{ currentEvent.title }}
            </h2>
            <button (click)="close()" class="text-gray-400 hover:text-gray-200 text-2xl leading-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="max-h-[70vh] overflow-y-auto pr-2">
              <p class="text-gray-300 whitespace-pre-wrap mb-6">
                {{ currentEvent.summary || 'Tidak ada ringkasan.' }}
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Lokasi -->
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Lokasi</h3>
                    @if (getLocationName(currentEvent.locationId); as locationName) {
                        <div class="flex items-center gap-2 bg-gray-700/50 p-3 rounded-md">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-400">
                               <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.4-.22.655-.368.201-.115.406-.238.6-.371.192-.132.378-.272.553-.417l1.026-.859c.092-.076.183-.153.271-.231l.01-.01.004-.004c.06-.05.118-.1.173-.154l.023-.023a1.48 1.48 0 00.16-.165c.04-.044.078-.09.114-.138l.001-.001.001-.001c.11-.15.21-.308.302-.475l.003-.006a1.498 1.498 0 00.15-.31c.02-.05.038-.1.055-.154l.003-.008a1.5 1.5 0 00.044-.19c.01-.06.018-.12.024-.182l.002-.007a1.5 1.5 0 00.02-.204c.002-.07.004-.14.004-.21v-.002a7 7 0 00-14 0c0 .07.002.14.004.21v.002l.002.007c.006.06.013.12.023.182.006.05.013.1.02.15l.002.006.002.007c.01.06.02.12.03.18a1.5 1.5 0 00.045.19c.006.05.013.1.02.15l.002.006.004.008c.02.05.04.1.06.15l.003.004.008.008c.04.04.08.09.12.14l.002.002.003.003a1.48 1.48 0 00.16.165l.023.023c.05.05.11.1.17.15l.003.003.006.004c.09.08.18.15.27.23l.002.002 1.026.86c.17.14.36.28.55.41l.002.002c.19.13.39.25.6.37a7.22 7.22 0 00.65.37l.02.01.03.01a5.74 5.74 0 00.28.14l.017.008.007.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
                               <path d="M10 12.5a.5.5 0 01-.5-.5v-2a.5.5 0 011 0v2a.5.5 0 01-.5.5z" />
                             </svg>
                            <span class="text-white font-medium">{{ locationName }}</span>
                        </div>
                    } @else {
                        <p class="text-gray-500 italic">Tidak ada lokasi spesifik.</p>
                    }
                </div>
                
                <!-- Karakter Terlibat -->
                <div>
                    <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Karakter Terlibat</h3>
                    @if (getCharacterNames(currentEvent.characterIds); as charNames) {
                        @if (charNames.length > 0) {
                            <div class="space-y-2">
                                @for (name of charNames; track name) {
                                    <div class="flex items-center gap-2 bg-gray-700/50 p-2 rounded-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-400">
                                          <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 8a3 3 0 100-6 3 3 0 000 6zM1.066 16.59a1.5 1.5 0 012.15-1.793A10.953 10.953 0 008 16.5c.343 0 .681-.01 1.014-.03A1.5 1.5 0 0110.8 17.1a10.953 10.953 0 004.784-1.703 1.5 1.5 0 012.15 1.793A12.452 12.452 0 0110 18c-2.43 0-4.72-.667-6.617-1.84a1.5 1.5 0 01-2.317-.57zM14.5 11.5c.204 0 .4-.006.593-.018a1.5 1.5 0 011.628 1.87A10.953 10.953 0 0018 16.5c.343 0 .681-.01 1.014-.03a1.5 1.5 0 011.628 1.87A12.452 12.452 0 0114.5 18c-1.597 0-3.098-.42-4.42-1.155a1.5 1.5 0 01-.416-2.21 1.5 1.5 0 012.21-.416A10.906 10.906 0 0014.5 16.5c.204 0 .4-.006.593-.018a1.5 1.5 0 011.628 1.87A10.953 10.953 0 0018 16.5c.343 0 .681-.01 1.014-.03a1.5 1.5 0 011.628 1.87A12.452 12.452 0 0114.5 18c-2.43 0-4.72-.667-6.617-1.84a1.5 1.5 0 01-2.317-.57z" />
                                        </svg>
                                        <span class="text-white">{{ name }}</span>
                                    </div>
                                }
                            </div>
                        } @else {
                             <p class="text-gray-500 italic">Tidak ada karakter yang terlibat.</p>
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
