// src/app/pages/editor-page/editor-page.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy, effect, ElementRef, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, map } from 'rxjs';
import { CurrentBookStateService } from '../../state/current-book-state.service';
import type { IChapter } from '../../../types/data';

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
          <div class="flex-shrink-0 text-right flex items-center">
            
            @if (isSaving()) {
              <span class="hidden text-sm text-gray-500 dark:text-gray-400 transition-opacity duration-300 ease-in-out sm:inline mr-3">
                Saving...
              </span>
            } @else if (showSavedConfirmation()) {
              <span class="hidden text-sm text-green-600 dark:text-green-400 transition-opacity duration-300 ease-in-out sm:inline mr-3">
                Saved
              </span>
            } @else if (isDirty()) {
              <span class="hidden text-sm text-gray-600 dark:text-gray-400 transition-opacity duration-300 ease-in-out sm:inline mr-3">
                Unsaved changes
              </span>
            } @else {
               <span class="hidden text-sm text-gray-600 dark:text-gray-400 transition-opacity duration-300 ease-in-out sm:inline mr-3">
                All saved
              </span>
            }

            <button 
              (click)="saveContent()" 
              [disabled]="!isDirty() || isSaving() || showSavedConfirmation()"
              class="ml-2 rounded-md px-3 py-1.5 text-sm font-semibold text-white transition-all duration-150 
                     w-28 flex items-center justify-center
                     disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-purple-500"
              [class.bg-purple-600]="!showSavedConfirmation()" [class.hover:bg-purple-700]="!showSavedConfirmation()"
              [class.bg-green-600]="showSavedConfirmation()"
              [class.opacity-50]="!isDirty()"
              [class.opacity-100]="isDirty()">
              
              @if (isSaving()) {
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              } @else if (showSavedConfirmation()) {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              } @else {
                <span>Save</span>
              }
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
    /* Base Editor styles */
    .quill-container .ql-editor {
      font-family: 'Lora', 'ui-serif', 'Georgia', 'Cambria', 'serif'; 
      font-size: 1.125rem; 
      line-height: 1.8;
      padding: 1.5rem 2rem;
      color: #1f2937; /* gray-900 */
      height: 100%;
      max-width: 48rem; /* 3xl (768px) */
      margin: 0 auto;
    }
    .ql-snow.ql-container {
      border: none !important;
      height: calc(100% - 55px); /* Adjusted height for new toolbar */
    }

    /* --- TOOLBAR REDESIGN (LIGHT MODE) --- */
    .ql-toolbar {
      max-width: 48rem;
      margin: 0 auto;
      background-color: #f3f4f6; /* gray-100 */
      border-bottom: 1px solid #d1d5db !important;
      border-top: 0 !important; border-left: 0 !important; border-right: 0 !important;
      position: sticky;
      top: 0;
      z-index: 10;
      
      /* Single-line scrollable styles */
      display: flex !important;
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 8px 12px !important;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none; /* Firefox */
      position: relative;
    }
    .ql-toolbar::-webkit-scrollbar {
      display: none; /* WebKit */
    }
    /* Gradient fade effect to indicate more content */
    .ql-toolbar::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 40px;
      background: linear-gradient(to left, #f3f4f6, transparent);
      pointer-events: none;
    }
    .ql-toolbar .ql-formats {
      display: flex !important;
      margin-right: 12px !important;
      white-space: nowrap;
    }
    .ql-toolbar button, .ql-toolbar .ql-picker {
      border-radius: 6px;
      transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
      margin: 0 2px;
      padding: 4px 8px; /* Added padding */
    }
    .ql-toolbar button:hover, .ql-toolbar .ql-picker:hover {
      background-color: #e5e7eb; /* gray-200 */
    }
    .ql-toolbar .ql-stroke { stroke: #4b5563; } /* gray-600 */
    .ql-toolbar .ql-picker-label { color: #4b5563; } /* gray-600 */
    .ql-toolbar .ql-active {
      background-color: #e9d5ff !important; /* purple-200 */
    }
    .ql-toolbar .ql-active .ql-stroke { stroke: #9333ea !important; } /* purple-600 */
    .ql-toolbar .ql-active .ql-picker-label { color: #9333ea !important; } /* purple-600 */

    /* --- DARK MODE STYLES --- */
    :host-context(.dark) .quill-container .ql-editor {
      color: #d1d5db; /* gray-300 */
    }
    :host-context(.dark) .ql-toolbar {
      background-color: #1f2937; /* gray-800 */
      border-bottom-color: #374151 !important; /* gray-700 */
    }
    :host-context(.dark) .ql-toolbar::after {
      background: linear-gradient(to left, #1f2937, transparent);
    }
    :host-context(.dark) .ql-toolbar button:hover, :host-context(.dark) .ql-toolbar .ql-picker:hover {
      background-color: #374151; /* gray-700 */
    }
    :host-context(.dark) .ql-toolbar .ql-stroke { stroke: #9ca3af; } /* gray-400 */
    :host-context(.dark) .ql-toolbar .ql-picker-label { color: #9ca3af; } /* gray-400 */
    :host-context(.dark) .ql-toolbar .ql-active {
      background-color: #581c87 !important; /* purple-900 */
    }
    :host-context(.dark) .ql-toolbar .ql-active .ql-stroke { stroke: #c084fc !important; } /* purple-400 */
    :host-context(.dark) .ql-toolbar .ql-active .ql-picker-label { color: #c084fc !important; } /* purple-400 */
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  public bookState = inject(CurrentBookStateService);

  editorRef = viewChild.required<ElementRef>('editor');

  chapter = signal<IChapter | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  isDirty = signal(false);
  showSavedConfirmation = signal(false);
  
  private chapterId = signal<number | null>(null);
  private subscriptions = new Subscription();
  private quill: any;
  private saveTimeout: any;
  private savedConfirmationTimeout: any;

  constructor() {
    effect(() => {
      const chapterId = this.chapterId();
      if (chapterId !== null) {
        const chapters = this.bookState.chapters();
        const foundChapter = chapters.find(c => c.id === chapterId);
        this.chapter.set(foundChapter || null);
        this.isLoading.set(false);
        if (foundChapter) {
          this.isDirty.set(false); // Reset dirty state on chapter load
          this.setupQuill();
        }
      }
    }, { allowSignalWrites: true });

    effect(() => {
        // This effect will run when editorRef becomes available
        const editorEl = this.editorRef();
        if(editorEl && this.chapter() && !this.quill) {
            this.setupQuill();
        }
    });
  }

  ngOnInit(): void {
    const chapterIdSub = this.route.params.pipe(
      map(params => Number(params['chapterId']))
    ).subscribe(id => {
      if (!isNaN(id)) {
        this.quill = null; // Reset quill instance when chapter changes
        this.chapterId.set(id);
        const chapters = this.bookState.chapters();
        if (chapters.length === 0) {
            const bookId = this.bookState.currentBookId();
            if(bookId) {
                // Eagerly load chapters if they aren't present
                this.bookState.loadChapters(bookId);
            }
        }
      } else {
        this.isLoading.set(false);
        this.chapter.set(null);
      }
    });
    this.subscriptions.add(chapterIdSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    clearTimeout(this.saveTimeout);
    clearTimeout(this.savedConfirmationTimeout);
    if(this.quill) {
        this.quill.off('text-change', this.onEditorChange);
    }
  }

  private setupQuill(): void {
    const editorEl = this.editorRef()?.nativeElement;
    if (!editorEl || this.quill) return;

    this.quill = new Quill(editorEl, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      },
      placeholder: 'Start writing your story...'
    });

    const currentContent = this.chapter()?.content;
    if (currentContent) {
      try {
        const delta = JSON.parse(currentContent);
        this.quill.setContents(delta, 'silent');
      } catch (e) {
        this.quill.setText(currentContent, 'silent');
      }
    } else {
      this.quill.setText('', 'silent');
    }
    
    this.isDirty.set(false);
    this.quill.on('text-change', this.onEditorChange);
  }
  
  private onEditorChange = (delta: any, oldDelta: any, source: string): void => {
    if (source === 'user') {
      this.isDirty.set(true);
      this.showSavedConfirmation.set(false);
      clearTimeout(this.savedConfirmationTimeout);
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => this.saveContent(), 1500);
    }
  }

  async saveContent(): Promise<void> {
    if (!this.isDirty() || this.isSaving() || !this.quill) return;

    this.isSaving.set(true);
    clearTimeout(this.saveTimeout);
    
    const content = JSON.stringify(this.quill.getContents());
    const chapterId = this.chapter()?.id;
    
    if (chapterId) {
      try {
        await this.bookState.updateChapterContent(chapterId, content);
        this.isDirty.set(false);
        this.showSavedConfirmation.set(true);
        clearTimeout(this.savedConfirmationTimeout);
        this.savedConfirmationTimeout = setTimeout(() => this.showSavedConfirmation.set(false), 2000);
      } catch (error) {
        console.error("Failed to save content", error);
      } finally {
        this.isSaving.set(false);
      }
    }
  }
}
