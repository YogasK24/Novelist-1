// src/app/components/dashboard/help-modal/help-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div 
      class="fixed inset-0 bg-black/70 flex justify-center items-center z-50
             transition-opacity duration-300"
      [class.opacity-100]="show()"
      [class.opacity-0]="!show()"
      [class.pointer-events-none]="!show()"
      (click)="closeModal.emit()" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg 
               ring-1 ring-black/5 dark:ring-white/10
               transform transition-all duration-300 ease-in-out"
        [class.opacity-100]="show()" [class.translate-y-0]="show()" [class.scale-100]="show()"
        [class.opacity-0]="!show()" [class.-translate-y-10]="!show()" [class.scale-95]="!show()"
        (click)="$event.stopPropagation()" 
      >
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <app-icon name="outline-help-question-24" class="w-6 h-6 text-accent-600 dark:text-accent-400" />
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
              Bantuan & Informasi
            </h2>
          </div>
          <button (click)="closeModal.emit()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">
            <app-icon name="outline-x-mark-24" class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4 text-gray-700 dark:text-gray-300">
          <p>Welcome to the Novelist App! This is an application to help you plan and write your novels.</p>
          <h3 class="font-semibold text-gray-900 dark:text-gray-200">Main Features:</h3>
          <ul class="list-disc list-inside space-y-1">
            <li><span class="font-semibold">Dashboard:</span> Manage all your novels. Use the 'ADD BOOK' button to get started.</li>
            <li><span class="font-semibold">Book View:</span> Click on a novel to enter the planning mode (World Building). Here you can add Characters, Locations, Plot Events, etc.</li>
            <li><span class="font-semibold">Write Mode:</span> Click the "Write" button in the bottom navigation (inside the Book View) to enter the focused editor and start writing your chapters.</li>
            <li><span class="font-semibold">Search:</span> Use the top search bar for global searches, or use the search bar inside the Book View to filter items within that tab.</li>
          </ul>
        </div>
        
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpModalComponent {
  show = input.required<boolean>();
  closeModal = output<void>();
}
