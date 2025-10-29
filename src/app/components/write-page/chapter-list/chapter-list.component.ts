// src/app/components/write-page/chapter-list/chapter-list.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { IChapter } from '../../../../types/data';

@Component({
  selector: 'app-chapter-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-white">Chapters</h2>
        <button (click)="addChapter.emit()" class="p-1 text-gray-400 hover:text-white" aria-label="Add new chapter">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </button>
      </div>
      
      @if (chapters() && chapters()!.length > 0) {
        <ul class="space-y-2">
          @for (chapter of chapters(); track chapter.id) {
            <li 
              (click)="selectChapter(chapter.id!)"
              class="group flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors"
              [class.bg-purple-600/50]="chapter.id === selectedChapterId()"
              [class.hover:bg-gray-700]="chapter.id !== selectedChapterId()">
              <span class="truncate pr-2 text-white">{{ chapter.title }}</span>
              <button 
                (click)="onDelete(chapter, $event)" 
                class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1" 
                aria-label="Delete chapter">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
              </button>
            </li>
          }
        </ul>
      } @else {
        <p class="text-sm text-gray-500 text-center py-4">Belum ada bab.</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChapterListComponent {
  chapters = input<IChapter[] | null>();
  selectedChapterId = input<number | null>();

  chapterSelected = output<number>();
  addChapter = output<void>();
  deleteChapter = output<number>();

  selectChapter(id: number): void {
    this.chapterSelected.emit(id);
  }

  onDelete(chapter: IChapter, event: MouseEvent): void {
    event.stopPropagation();
    if (window.confirm(`Yakin ingin menghapus bab "${chapter.title}"?`)) {
      this.deleteChapter.emit(chapter.id!);
    }
  }
}
