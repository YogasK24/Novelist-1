// src/app/components/dashboard/bulk-action-bar/bulk-action-bar.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookStateService } from '../../../state/book-state.service';
import { UiStateService } from '../../../state/ui-state.service';
import { ConfirmationService } from '../../../state/confirmation.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-bulk-action-bar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="fixed bottom-0 left-0 right-0 z-30
                bg-white dark:bg-gray-800 
                border-t border-gray-300 dark:border-gray-700 shadow-lg
                transform transition-transform duration-300 ease-in-out"
         [class.translate-y-full]="!uiState.isSelectMode()">
      
      <div class="container mx-auto px-4 py-3 max-w-7xl 
                  flex justify-between items-center">
        
        <div class="flex items-center gap-4">
          <button (click)="uiState.exitSelectMode()"
                  class="p-2 rounded-full text-gray-600 dark:text-gray-400 
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Batal Pilih">
            <app-icon name="outline-x-mark-24" class="w-6 h-6"></app-icon>
          </button>
          <span class="font-semibold text-gray-900 dark:text-gray-200">
            {{ bookState.selectedBooksCount() }} novel dipilih
          </span>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="handleArchive()"
                  [disabled]="bookState.selectedBooksCount() === 0"
                  class="px-4 py-2 rounded-md font-medium text-sm
                         text-gray-700 dark:text-gray-300 
                         bg-gray-100 dark:bg-gray-700 
                         hover:bg-gray-200 dark:hover:bg-gray-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            @if (bookState.areAllSelectedBooksArchived()) {
              <span>Batal Arsip</span>
            } @else {
              <span>Arsipkan</span>
            }
          </button>
          <button (click)="handleDelete()"
                  [disabled]="bookState.selectedBooksCount() === 0"
                  class="px-4 py-2 rounded-md font-medium text-sm
                         text-white bg-red-600 hover:bg-red-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Hapus
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkActionBarComponent {
  readonly bookState = inject(BookStateService);
  readonly uiState = inject(UiStateService);
  private readonly confirmationService = inject(ConfirmationService);

  handleArchive(): void {
    const shouldArchive = !this.bookState.areAllSelectedBooksArchived();
    this.bookState.toggleArchiveForSelectedBooks(shouldArchive);
  }

  handleDelete(): void {
    const count = this.bookState.selectedBooksCount();
    this.confirmationService.requestConfirmation({
      message: `Yakin ingin menghapus ${count} novel terpilih? Ini akan menghapus semua chapter dan data di dalamnya secara permanen.`,
      confirmButtonText: 'Ya, Hapus Semua',
      onConfirm: () => {
        this.bookState.deleteSelectedBooks();
      }
    });
  }
}