// src/app/pages/editor-page/editor-page.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy, effect, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CurrentBookStateService } from '../../state/current-book-state.service';
import type { IChapter } from '../../../types/data';

declare var Quill: any;

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="h-screen bg-gray-800 text-gray-200 flex flex-col">
      <header class="bg-gray-900 shadow-md sticky top-0 z-40 flex-shrink-0">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between">
          @if (bookState.currentBook(); as book) {
            <a [routerLink]="['/book', book.id, 'write']" class="flex items-center gap-2 text-white hover:text-gray-300 transition duration-150 p-2 -ml-2 rounded-lg" aria-label="Back to Chapters">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span class="hidden sm:inline">All Chapters</span>
            </a>
          }
          <h1 class="text-lg font-semibold text-white truncate mx-4 text-center">
            {{ chapter()?.title || 'Loading...' }}
          </h1>
          <div class="w-28 text-right">
            <span class="text-sm transition-opacity" [class.opacity-100]="isDirty()" [class.opacity-0]="!isDirty()">Unsaved changes</span>
            <button 
              (click)="saveContent()" 
              [disabled]="!isDirty() || isSaving()"
              class="ml-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 text-sm">
              {{ isSaving() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </header>

      @if (isLoading()) {
        <div class="flex-grow flex justify-center items-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400"></div>
        </div>
      } @else if (chapter()) {
        <main class="flex-grow overflow-y-auto p-4 md:p-8 quill-container">
          <div #editor></div>
        </main>
      } @else {
        <div class="m-auto text-center text-gray-500">
          <h3 class="text-xl">Chapter not found.</h3>
          @if(bookState.currentBookId(); as bookId) {
             <a [routerLink]="['/book', bookId, 'write']" class="text-purple-400 hover:underline">Back to chapters</a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .quill-container {
      height: calc(100% - 1rem); /* Fallback */
      height: calc(100% - 1rem);
    }
    .quill-container .ql-editor {
      font-size: 1.125rem;
      line-height: 1.75;
      color: #d1d5db; /* gray-300 */
      height: 100%;
      padding-top: 1rem;
    }
    .ql-toolbar {
      border-color: #4b5563 !important; /* gray-600 */
      border-left: 0 !important;
      border-right: 0 !important;
      border-top: 0 !important;
      padding: 12px 8px !important;
    }
    .ql-toolbar .ql-stroke {
      stroke: #9ca3af; /* gray-400 */
    }
    .ql-toolbar .ql-picker-label {
      color: #9ca3af; /* gray-400 */
    }
    .ql-toolbar .ql-active .ql-stroke {
      stroke: #c4b5fd; /* violet-300 */
    }
     .ql-toolbar .ql-active .ql-fill {
      fill: #c4b5fd; /* violet-300 */
    }
    .ql-toolbar .ql-active .ql-picker-label {
      color: #c4b5fd; /* violet-300 */
    }
    .ql-snow.ql-container {
      border: none !important;
      height: calc(100% - 42px);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  public bookState = inject(CurrentBookStateService);
  
  @ViewChild('editor') editorEl!: ElementRef;
  private quillInstance: any;
  private contentUpdateTimer: any;

  private routeSub?: Subscription;

  bookId = signal<number | null>(null);
  chapterId = signal<number | null>(null);

  isLoading = signal(true);
  isSaving = signal(false);
  isDirty = signal(false);

  chapter = computed(() => {
    const chapId = this.chapterId();
    if (chapId === null) return null;
    return this.bookState.chapters().find(c => c.id === chapId) ?? null;
  });

  constructor() {
    effect(() => {
        const currentChapter = this.chapter();
        if (this.quillInstance && currentChapter && !this.isDirty()) {
            const editorContent = this.quillInstance.getContents();
            try {
              const currentContent = JSON.parse(currentChapter.content || '{"ops":[]}');
              if (JSON.stringify(editorContent) !== JSON.stringify(currentContent)) {
                  this.quillInstance.setContents(currentContent, 'silent');
              }
            } catch(e) {
               // Handle plain text from old editor
               this.quillInstance.setText(currentChapter.content, 'silent');
            }
        }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(async params => {
      this.isLoading.set(true);
      const bookId = Number(params['id']);
      const chapterId = Number(params['chapterId']);

      if (!isNaN(bookId) && !isNaN(chapterId)) {
        this.bookId.set(bookId);
        this.chapterId.set(chapterId);
        if(this.bookState.currentBookId() !== bookId) {
            this.bookState.loadBookData(bookId);
        }
        await this.bookState.loadChapters(bookId);
        this.isLoading.set(false);
      } else {
        console.error("Invalid Book/Chapter ID:", params);
        this.isLoading.set(false);
      }
    });
  }
  
  ngAfterViewInit(): void {
      // Use an effect to initialize Quill once the editor element and chapter data are ready
      effect(() => {
        if (this.chapter() && this.editorEl && !this.quillInstance) {
          this.initQuill();
        }
      });
  }

  initQuill(): void {
    if (!this.editorEl?.nativeElement || this.quillInstance) return;

    this.quillInstance = new Quill(this.editorEl.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['blockquote', 'code-block'],
          ['clean']
        ]
      },
      placeholder: 'Mulai menulis...'
    });

    try {
        const content = this.chapter()?.content;
        if (content && content.trim().startsWith('{')) {
          this.quillInstance.setContents(JSON.parse(content));
        } else if (content) {
          this.quillInstance.setText(content); // Handle plain text legacy content
        }
    } catch (e) {
        console.error("Could not parse chapter content", e);
        if (typeof this.chapter()?.content === 'string') {
          this.quillInstance.setText(this.chapter()!.content);
        }
    }

    this.quillInstance.on('text-change', () => {
      if (!this.isDirty()) {
          this.isDirty.set(true);
      }
      // Debounce saving
      clearTimeout(this.contentUpdateTimer);
      this.contentUpdateTimer = setTimeout(() => this.saveContent(), 1500); // Auto-save after 1.5s of inactivity
    });
  }

  async saveContent(): Promise<void> {
    const chap = this.chapter();
    if (!chap || !this.quillInstance || !this.isDirty()) return;

    this.isSaving.set(true);
    try {
      const content = JSON.stringify(this.quillInstance.getContents());
      await this.bookState.updateChapterContent(chap.id!, content);
      this.isDirty.set(false);
    } catch(e) {
      console.error("Failed to save content", e);
    } finally {
      this.isSaving.set(false);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.contentUpdateTimer);
    this.routeSub?.unsubscribe();
  }
}
