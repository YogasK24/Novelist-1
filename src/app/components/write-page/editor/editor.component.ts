// src/app/components/write-page/editor/editor.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { IChapter } from '../../../../types/data';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col p-4 sm:p-6 md:p-8">
      @if (chapter(); as currentChapter) {
        <div class="flex-shrink-0 mb-4">
          <h2 class="text-3xl font-bold text-white border-b-2 border-gray-700 pb-2">
            {{ currentChapter.title }}
          </h2>
        </div>
        
        <div class="flex-grow flex flex-col">
          <textarea 
            [(ngModel)]="content"
            (ngModelChange)="onContentChange()"
            class="w-full h-full bg-transparent text-gray-300 text-lg leading-relaxed resize-none focus:outline-none flex-grow"
            placeholder="Mulai menulis...">
          </textarea>
        </div>

        <div class="flex-shrink-0 mt-4 flex justify-between items-center text-sm text-gray-400">
          <span>Jumlah Kata: {{ wordCount() }}</span>
          <button 
            (click)="saveContent()" 
            [disabled]="!isDirty()"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150">
            Save
          </button>
        </div>
      } @else {
        <div class="m-auto text-center text-gray-500">
          <h3 class="text-xl">Pilih bab untuk mulai menulis</h3>
          <p>Atau buat yang baru dari sidebar.</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent {
  chapter = input<IChapter | null>();
  contentSaved = output<{ id: number; content: string }>();

  content = signal('');
  isDirty = signal(false);
  wordCount = signal(0);
  
  constructor() {
    effect(() => {
      const currentChapter = this.chapter();
      if (currentChapter) {
        this.content.set(currentChapter.content);
        this.calculateWordCount(currentChapter.content);
        this.isDirty.set(false);
      } else {
        this.content.set('');
        this.wordCount.set(0);
        this.isDirty.set(false);
      }
    });
  }

  onContentChange(): void {
    this.isDirty.set(true);
    this.calculateWordCount(this.content());
  }

  calculateWordCount(text: string): void {
    if (!text || text.trim() === '') {
      this.wordCount.set(0);
      return;
    }
    const words = text.trim().split(/\s+/);
    this.wordCount.set(words.length);
  }

  saveContent(): void {
    const currentChapter = this.chapter();
    if (currentChapter && currentChapter.id) {
      this.contentSaved.emit({ id: currentChapter.id, content: this.content() });
      this.isDirty.set(false);
    }
  }
}