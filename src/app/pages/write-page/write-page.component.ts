// src/app/pages/write-page/write-page.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CurrentBookStateService } from '../../state/current-book-state.service';
import type { IChapter } from '../../../types/data';

import { WritePageHeaderComponent } from '../../components/write-page/write-page-header/write-page-header.component';
import { ChapterListComponent } from '../../components/write-page/chapter-list/chapter-list.component';
import { EditorComponent } from '../../components/write-page/editor/editor.component';

@Component({
  selector: 'app-write-page',
  standalone: true,
  imports: [
    CommonModule,
    WritePageHeaderComponent,
    ChapterListComponent,
    EditorComponent,
  ],
  template: `
    <div class="h-screen bg-gray-900 text-gray-200 flex flex-col">
      <app-write-page-header></app-write-page-header>
      
      @if (bookState.isLoading() === 'loading' || bookState.isLoading() === 'initial') {
        <div class="flex-grow flex justify-center items-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400"></div>
        </div>
      } @else if (bookState.chapters(); as chapters) {
        <div class="flex-grow flex overflow-hidden">
          <!-- Chapter List Sidebar -->
          <aside class="w-1/4 min-w-[250px] max-w-[350px] bg-gray-800/50 border-r border-white/10 overflow-y-auto">
            <app-chapter-list
              [chapters]="chapters"
              [selectedChapterId]="selectedChapterId()"
              (chapterSelected)="selectChapter($event)"
              (addChapter)="addChapter()"
              (deleteChapter)="deleteChapter($event)">
            </app-chapter-list>
          </aside>

          <!-- Editor -->
          <main class="flex-grow overflow-y-auto">
            <app-editor
              [chapter]="selectedChapter()"
              (contentSaved)="saveChapterContent($event)">
            </app-editor>
          </main>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WritePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  public bookState = inject(CurrentBookStateService);

  private routeSub?: Subscription;

  selectedChapterId = signal<number | null>(null);

  selectedChapter = computed(() => {
    const id = this.selectedChapterId();
    const chapters = this.bookState.chapters();
    if (id === null || !chapters) return null;
    return chapters.find(c => c.id === id) ?? null;
  });

  constructor() {
    effect(() => {
        const chapters = this.bookState.chapters();
        // Jika chapter yang dipilih saat ini dihapus, batalkan pilihan
        if (this.selectedChapterId() && !chapters.some(c => c.id === this.selectedChapterId())) {
            this.selectedChapterId.set(null);
        }
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const bookId = Number(params['id']);
      if (!isNaN(bookId)) {
        this.bookState.loadBookData(bookId);
      } else {
        console.error("Invalid Book ID:", params['id']);
        this.bookState.clearBookData();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.bookState.clearBookData();
  }

  selectChapter(chapterId: number): void {
    this.selectedChapterId.set(chapterId);
  }

  addChapter(): void {
    const title = prompt("Masukkan judul bab baru:", `Bab ${this.bookState.chapters().length + 1}`);
    if (title) {
      // FIX: Provide an empty array for characterIds as the second argument.
      this.bookState.addChapter(title, []);
    }
  }

  deleteChapter(chapterId: number): void {
    this.bookState.deleteChapter(chapterId);
  }
  
  updateChapterTitle(event: { id: number; title: string }): void {
    // FIX: Provide the existing characterIds to prevent data loss on title update.
    const chapter = this.bookState.chapters().find(c => c.id === event.id);
    this.bookState.updateChapterTitle(event.id, event.title, chapter?.characterIds ?? []);
  }

  saveChapterContent(event: { id: number; content: string }): void {
    this.bookState.updateChapterContent(event.id, event.content);
  }
}