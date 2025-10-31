import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../../state/confirmation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (confirmationService.request(); as request) {
      <div 
        class="fixed inset-0 bg-black/70 flex justify-center items-center z-50 
               transition-opacity duration-300"
        [class.opacity-100]="isShown()"
        [class.opacity-0]="!isShown()"
        [class.pointer-events-none]="!isShown()"
        (click)="onCancel()" 
        aria-modal="true"
        role="dialog"
      >
        <div 
          class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md ring-1 ring-black/5 dark:ring-white/10
                 transform transition-all duration-300 ease-in-out"
          [class.opacity-100]="isShown()" [class.translate-y-0]="isShown()" [class.scale-100]="isShown()"
          [class.opacity-0]="!isShown()" [class.-translate-y-10]="!isShown()" [class.scale-95]="!isShown()"
          (click)="$event.stopPropagation()" 
        >
          <div class="flex items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
              <app-icon name="outline-exclamation-circle-24" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                Konfirmasi
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ request.message }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              (click)="onConfirm()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
            >
              {{ request.confirmButtonText }}
            </button>
            <button
              type="button"
              (click)="onCancel()"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              {{ request.cancelButtonText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent {
  public confirmationService = inject(ConfirmationService);
  isShown = signal(false);

  constructor() {
    effect(() => {
      if (this.confirmationService.request()) {
        setTimeout(() => this.isShown.set(true), 10);
      } else {
        this.isShown.set(false);
      }
    });
  }

  onConfirm(): void {
    const request = this.confirmationService.request();
    if (request) {
      request.onConfirm();
      this.confirmationService.closeConfirmation();
    }
  }

  onCancel(): void {
    const request = this.confirmationService.request();
    if (request) {
      request.onCancel();
      // onCancel sudah memanggil closeConfirmation secara default
    }
  }
}
