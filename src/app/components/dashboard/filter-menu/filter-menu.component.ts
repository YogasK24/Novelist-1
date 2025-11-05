// src/app/components/dashboard/filter-menu/filter-menu.component.ts
import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookStateService } from '../../../state/book-state.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-filter-menu',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (show()) {
      <div (click)="$event.stopPropagation()"
            class="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-700 rounded-lg shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-30
                    transform transition-all duration-150 ease-out origin-top-right">
        <div class="p-4 space-y-4">
          
          <div>
            <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Urutkan berdasarkan</h4>
            <div class="grid grid-cols-2 gap-2">
              <button (click)="bookState.setSort('lastModified')"
                      class="flex items-center justify-center gap-1.5 px-2 py-1.5 text-sm rounded-md transition-colors"
                      [class.bg-accent-100]="bookState.sortConfig().mode === 'lastModified'"
                      [class.dark:bg-accent-900/40]="bookState.sortConfig().mode === 'lastModified'"
                      [class.text-accent-700]="bookState.sortConfig().mode === 'lastModified'"
                      [class.dark:text-accent-300]="bookState.sortConfig().mode === 'lastModified'"
                      [class.font-semibold]="bookState.sortConfig().mode === 'lastModified'"
                      [class.bg-gray-100]="bookState.sortConfig().mode !== 'lastModified'"
                      [class.dark:bg-gray-800]="bookState.sortConfig().mode !== 'lastModified'"
                      [class.hover:bg-gray-200]="bookState.sortConfig().mode !== 'lastModified'"
                      [class.dark:hover:bg-gray-600]="bookState.sortConfig().mode !== 'lastModified'">
                <span>Terakhir Diubah</span>
                @if (bookState.sortConfig().mode === 'lastModified') {
                  @if (bookState.sortConfig().direction === 'desc') {
                    <app-icon name="outline-arrow-down-24" class="w-4 h-4"></app-icon>
                  } @else {
                    <app-icon name="outline-arrow-up-24" class="w-4 h-4"></app-icon>
                  }
                }
              </button>
              <button (click)="bookState.setSort('title')"
                      class="flex items-center justify-center gap-1.5 px-2 py-1.5 text-sm rounded-md transition-colors"
                      [class.bg-accent-100]="bookState.sortConfig().mode === 'title'"
                      [class.dark:bg-accent-900/40]="bookState.sortConfig().mode === 'title'"
                      [class.text-accent-700]="bookState.sortConfig().mode === 'title'"
                      [class.dark:text-accent-300]="bookState.sortConfig().mode === 'title'"
                      [class.font-semibold]="bookState.sortConfig().mode === 'title'"
                      [class.bg-gray-100]="bookState.sortConfig().mode !== 'title'"
                      [class.dark:bg-gray-800]="bookState.sortConfig().mode !== 'title'"
                      [class.hover:bg-gray-200]="bookState.sortConfig().mode !== 'title'"
                      [class.dark:hover:bg-gray-600]="bookState.sortConfig().mode !== 'title'">
                <span>Judul</span>
                @if (bookState.sortConfig().mode === 'title') {
                  @if (bookState.sortConfig().direction === 'asc') {
                    <app-icon name="outline-arrow-up-24" class="w-4 h-4"></app-icon>
                  } @else {
                    <app-icon name="outline-arrow-down-24" class="w-4 h-4"></app-icon>
                  }
                }
              </button>
            </div>
          </div>
          
          <div class="border-t border-gray-200 dark:border-gray-600"></div>

          <div>
            <div class="relative flex items-start">
              <div class="flex items-center h-5">
                <input id="showArchived" type="checkbox"
                        [checked]="bookState.showArchived()"
                        (change)="bookState.toggleShowArchived()"
                        class="h-4 w-4 text-accent-600 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500">
              </div>
              <div class="ml-3 text-sm">
                <label for="showArchived" class="font-medium text-gray-700 dark:text-gray-300">Tampilkan novel yang diarsipkan</label>
              </div>
            </div>
          </div>

        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterMenuComponent {
  show = input.required<boolean>();
  public readonly bookState = inject(BookStateService);
}
