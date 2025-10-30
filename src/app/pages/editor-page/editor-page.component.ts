// src/app/pages/editor-page/editor-page.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy, effect, ElementRef, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, combineLatest, map } from 'rxjs';
import { CurrentBookStateService } from '../../state/current-book-state.service';
import type { IChapter } from '../../../types/data';
import { NotificationService } from '../../state/notification.service';

declare var Quill: any;

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (isLoading()) {
      <div class="flex h-full w-full items-center justify-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400 dark:border-purple-600"></div>
      </div>
    } @else if (chapter(); as currentChapter) {
      <div class="flex h-full flex-col p-4 sm:p-6 bg-white dark:bg-gray-800 transition-colors duration-500">
        <div class="mb-4 flex flex-shrink-0 items-center justify-between border-b border-gray-300 dark:border-gray-700 pb-3">
          <h2 class="truncate text-2xl font-bold text-gray-900 dark:text-gray-200" [title]="currentChapter.title">
            {{ currentChapter.title }}
          </h2>
          <div class="flex-shrink-0 text-right">
            <span class="hidden text-sm text-gray-600 dark:text-gray-400 transition-opacity sm:inline" [class.opacity-100]="isDirty()" [class.opacity-0]="!isDirty()">Unsaved changes</span>
            <button 
              (click)="saveContent()" 
              [disabled]="!isDirty() || isSaving()"
              class="ml-2 rounded-md bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50">
              {{ isSaving() ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
        
        <div class="quill-container flex-grow overflow-y-auto relative -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
          <div #editor class="h-full"></div>
        </div>

      </div>
    } @else {
      <div class="m-auto p-4 text-center text-gray-500 dark:text-gray-400">
        <h3 class="text-xl">Chapter not found.</h3>
        @if(bookState.currentBookId(); as bookId) {
            <a [routerLink]="['/book', bookId, 'write']" class="text-purple-600 dark:text-purple-400 hover:underline">Back to chapters</a>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow: hidden; 
    }
    /* Base styles (Light Mode Default) */
    .quill-container .ql-editor {
      /* UPDATE: Gunakan font Lora untuk konten */
      font-family: 'Lora', 'ui-serif', 'Georgia', 'Cambria', 'serif'; 
      font-size: 1.125rem; 
      line-height: 1.75;
      color: #1f2937; /* gray-900 */
      height: 100%;
      padding: 1rem 2rem; 
      
      /* --- PERUBAHAN UTAMA: Batasi Lebar Teks --- */
      max-width: 48rem; /* 3xl (768px) */
      margin: 0 auto;
    }
    .ql-toolbar {
      /* UPDATE: Toolbar juga menempel di max-width editor */
      max-width: 48rem; /* 3xl */
      margin: 0 auto;
      
      background-color: #f3f4f6; /* gray-100 */
      border-color: #d1d5db !important; /* gray-300 */
      border-left: 0 !important;
      border-right: 0 !important;
      border-top: 0 !important;
      padding: 8px !important;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .ql-toolbar .ql-stroke { stroke: #6b7280; } /* gray-500 */
    .ql-toolbar .ql-picker-label { color: #6b7280; } /* gray-500 */
    .ql-toolbar .ql-active .ql-stroke { stroke: #9333ea; } /* purple-700 */
    .ql-toolbar .ql-active .ql-fill { fill: #9333ea; } /* purple-700 */
    .ql-toolbar .ql-active .ql-picker-label { color: #9333ea; } /* purple-700 */
    .ql-snow.ql-container {
      border: none !important;
      height: calc(100% - 49px); 
    }

    /* DARK MODE OVERRIDES */
    html.dark .quill-container .ql-editor {
      color: #d1d5db; /* gray-300 */
    }
    html.dark .ql-toolbar {
      background-color: #374151; /* gray-700 */
      border-color: #4b5563 !important; /* gray-600 */
    }
    html.dark .ql-toolbar .ql-stroke { stroke: #9ca3af; } /* gray-400 */
    html.dark .ql-toolbar .ql-picker-label { color: #9ca3af; } /* gray-400 */
    html.dark .ql-toolbar .ql-active .ql-stroke { stroke: #c4b5fd; } /* purple-300 */
    html.dark .ql-toolbar .ql-active .ql-fill { fill: #c4b5fd; } /* purple-300 */
    html.dark .ql-toolbar .ql-active .ql-picker-label { color: #c4b5fd; } /* purple-300 */
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  public bookState = inject(CurrentBookStateService);
  private notificationService = inject(NotificationService);
  
  editorEl = viewChild<ElementRef>('editor');
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
    });

    // Inisialisasi Quill setelah elemen editor dan data chapter siap
    effect(() => {
      const editorElement = this.editorEl(); // Ini adalah ElementRef
      if (this.chapter() && editorElement && !this.quillInstance) {
        this.initQuill();
      }
    });
  }

  ngOnInit(): void {
    const parentRoute = this.route.parent;
    if (!parentRoute) {
      console.error("EditorPageComponent must be used within a parent route with a book ID.");
      this.isLoading.set(false);
      return;
    }

    this.routeSub = combineLatest({
      parentParams: parentRoute.params,
      childParams: this.route.params
    }).pipe(
      map(({ parentParams, childParams }) => {
        return { ...parentParams, ...childParams };
      })
    ).subscribe(async params => {
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
      } else {
        console.error("Invalid Book/Chapter ID:", params);
      }
      this.isLoading.set(false);
    });
  }

  initQuill(): void {
    const editorElement = this.editorEl()?.nativeElement;
    if (!editorElement || this.quillInstance) return;

    this.quillInstance = new Quill(editorElement, {
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
      this.notificationService.info('Perubahan disimpan otomatis.', 2000);
    } catch(e) {
      console.error("Failed to save content", e);
      this.notificationService.error('Gagal menyimpan perubahan.');
    } finally {
      this.isSaving.set(false);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.contentUpdateTimer);
    this.routeSub?.unsubscribe();
  }
}
