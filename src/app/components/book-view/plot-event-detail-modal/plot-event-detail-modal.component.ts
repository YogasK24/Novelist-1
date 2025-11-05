// src/app/components/book-view/plot-event-detail-modal/plot-event-detail-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { IPlotEvent } from '../../../../types/data';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { FocusTrapDirective } from '../../../directives/focus-trap.directive';

@Component({
  selector: 'app-plot-event-detail-modal',
  standalone: true,
  imports: [CommonModule, IconComponent, FocusTrapDirective],
  template: `
    <div 
      class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
      [class.opacity-100]="show()" [class.opacity-0]="!show()" [class.pointer-events-none]="!show()"
      (click)="close()" aria-modal="true" role="dialog">
      <div 
        appFocusTrap
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
              <app-icon name="outline-x-mark-24" class="w-6 h-6" />
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
                             <app-icon name="solid-map-pin-20" class="w-5 h-5 text-gray-400" />
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
                                        <app-icon name="solid-users-20" class="w-5 h-5 text-gray-400" />
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
