// src/app/components/dashboard/long-press-hint/long-press-hint.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-long-press-hint',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (show()) {
      <div class="fixed inset-0 bg-black/50 z-40" (click)="dismiss.emit()"></div>
      <div class="fixed top-40 left-1/2 -translate-x-1/2 w-full max-w-xs sm:max-w-sm px-4 z-50">
        <div class="relative animate-fade-in-down">
          <div class="bg-gray-800 dark:bg-gray-700 text-white p-4 rounded-lg shadow-2xl text-center">
            <h3 class="font-bold text-lg">Pro Tip!</h3>
            <p class="mt-2 text-sm">
              Tekan dan tahan pada sebuah novel untuk memilih beberapa item sekaligus.
            </p>
            <button 
              (click)="dismiss.emit()"
              class="mt-4 w-full px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent-500">
              Mengerti
            </button>
          </div>
          <!-- Arrow pointing down -->
          <div class="absolute top-full left-1/4 mt-2">
            <svg class="w-16 h-16 text-gray-800 dark:text-gray-700 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-down {
      animation: fadeInDown 0.5s ease-out forwards;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LongPressHintComponent {
  show = input.required<boolean>();
  dismiss = output<void>();
}
