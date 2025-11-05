// src/app/components/dashboard/book-list-skeleton/book-list-skeleton.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ViewMode } from '../../../state/book-state.service';

@Component({
  selector: 'app-book-list-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (viewMode() === 'grid') {
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        @for (_ of skeletonItems; track $index) {
          <div>
            <div class="shimmer h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
            <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
              <div class="shimmer h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="space-y-4">
        @for (_ of skeletonItems; track $index) {
          <div class="flex items-center space-x-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            <div class="shimmer h-20 w-16 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div class="flex-grow space-y-3">
              <div class="shimmer h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div class="shimmer h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
            <div class="flex-shrink-0 w-28 pr-4">
              <div class="shimmer h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .shimmer {
      position: relative;
      overflow: hidden;
    }

    .shimmer::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.2) 20%,
        rgba(255, 255, 255, 0.5) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmer 1.5s infinite;
    }

    :host-context(.dark) .shimmer::after {
      background-image: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0) 0,
        rgba(255, 255, 255, 0.05) 20%,
        rgba(255, 255, 255, 0.1) 60%,
        rgba(0, 0, 0, 0)
      );
    }

    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListSkeletonComponent {
  viewMode = input.required<ViewMode>();
  // Buat array untuk perulangan, jumlah item bisa disesuaikan
  skeletonItems = new Array(8); 
}
