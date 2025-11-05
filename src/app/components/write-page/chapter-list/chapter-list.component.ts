// src/app/components/write-page/chapter-list/chapter-list.component.ts
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CurrentBookStateService } from '../../../state/current-book-state.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { AddChapterModalComponent } from '../../book-view/add-chapter-modal/add-chapter-modal.component';

@Component({
  selector: 'app-write-chapter-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent, AddChapterModalComponent],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-200">Bab</h3>
        <button 
          (click)="openAddModal()"
          class="p-2 text-accent-600 dark:text-accent-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
          aria-label="Tambah bab baru">
          <app-icon name="outline-plus-24" class="w-5 h-5" />
        </button>
      </div>

      @if (bookState.isLoadingChapters()) {
        <div class="flex-grow flex justify-center items-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-600 dark:border-accent-400"></div>
        </div>
      } @else if (bookState.chapters(); as chapters) {
        @if (chapters.length > 0) {
          <nav class="flex-grow overflow-y-auto -mr-2 pr-2 space-y-1">
            @for (chap of chapters; track chap.id) {
              <a [routerLink]="['/book', bookState.currentBookId(), 'write', chap.id]"
                 routerLinkActive #rla="routerLinkActive"
                 [class.bg-accent-100]="rla.isActive"
                 [class.dark:bg-accent-900/30]="rla.isActive"
                 [class.text-accent-700]="rla.isActive"
                 [class.dark:text-accent-300]="rla.isActive"
                 [class.font-semibold]="rla.isActive"
                 class="block p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-150 group transform hover:scale-102">
                <span>{{ chap.order }}. {{ chap.title }}</span>
                <span class="block text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                   [class.text-accent-600]="rla.isActive"
                   [class.dark:text-accent-400]="rla.isActive">
                  {{ countWords(chap.content) }} kata
                </span>
              </a>
            }
          </nav>
        } @else {
          <div class="flex-grow flex flex-col justify-center items-center text-center text-gray-500 dark:text-gray-400">
            <app-icon name="outline-book-placeholder-24" class="w-10 h-10 mb-2" />
            <p class="text-sm">Belum ada bab.</p>
            <p class="text-xs">Klik '+' untuk memulai.</p>
          </div>
        }
      }
    </div>

    @if (showModal()) {
      <app-add-chapter-modal
        [show]="showModal()"
        [chapterToEdit]="null"
        (closeModal)="closeModal()">
      </app-add-chapter-modal>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChapterListComponent {
  public bookState = inject(CurrentBookStateService);
  showModal = signal(false);

  openAddModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  countWords(content: string): number {
    if (!content) return 0;
    try {
      if (content.trim().startsWith('{')) {
        const delta = JSON.parse(content);
        if (delta && Array.isArray(delta.ops)) {
          return delta.ops.reduce((count: number, op: any) => {
            if (typeof op.insert === 'string') {
              const words = op.insert.trim().split(/\s+/).filter(Boolean);
              return count + words.length;
            }
            return count;
          }, 0);
        }
      }
    } catch(e) { /* Fallback to plain text */ }
    return content.trim().split(/\s+/).filter(Boolean).length;
  }
}