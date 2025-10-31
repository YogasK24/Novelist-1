// src/app/components/write-page/editor-status-bar/editor-status-bar.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-editor-status-bar',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="sticky bottom-0 z-10 flex-shrink-0
                bg-gray-100 dark:bg-gray-900 
                border-t border-gray-300 dark:border-gray-700 
                px-4 py-1 text-right">
      <span class="text-sm text-gray-600 dark:text-gray-400">
        {{ wordCount() | number }} Kata
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorStatusBarComponent {
  wordCount = input.required<number>();
}
