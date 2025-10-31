// src/app/components/book-view/chapter-list/chapter-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, CdkDropList } from '@angular/cdk/drag-drop';
import { CurrentBookStateService } from '../../../state/current-book-state.service'; 
import type { IChapter } from '../../../../types/data';
import { AddChapterModalComponent } from '../add-chapter-modal/add-chapter-modal.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { ConfirmationService } from '../../../state/confirmation.service';

@Component({
  selector: 'app-chapter-list-tab',
  standalone: true,
  imports: [CommonModule, AddChapterModalComponent, DragDropModule, IconComponent],
  template: `
    <div>
      <div class="flex justify-between items-center mb-4 gap-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Manage your chapters here, or click 'Write' in the bottom navigation to enter editor mode.</p>
          <button 
            (click)="openAddModal()"
            class="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-md transition duration-150 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 dark:focus:ring-offset-gray-900">
            + Add Chapter
          </button>
      </div>


      @if (bookState.isLoadingChapters() || isReordering()) {
        <div class="flex justify-center items-center py-6"> 
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-400 dark:border-accent-600"></div> 
          @if (isReordering()) {
             <span class="ml-3 text-slate-400 dark:text-slate-500">Saving order...</span>
          }
        </div>
      } @else if (bookState.filteredChapters(); as chapters) {
         @if (chapters.length > 0) {
            <div cdkDropList 
                 [cdkDropListDisabled]="isReordering() || bookState.contextualSearchTerm().length > 0" 
                 (cdkDropListDropped)="onDrop($event)" 
                 #chapterList="cdkDropList" 
                 class="space-y-3 p-1 -mx-1 rounded-lg">
              @for (chap of chapters; track chap.id) {
                <div cdkDrag 
                     [cdkDragData]="chap" 
                     tabindex="0" 
                     (keydown)="onMoveItem(chap, $event)"
                     class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-start group hover:bg-slate-100 dark:hover:bg-slate-700/80 transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-accent-500"
                     [class.cursor-grab]="!isReordering() && bookState.contextualSearchTerm().length === 0"
                     [class.cursor-not-allowed]="isReordering() || bookState.contextualSearchTerm().length > 0"
                     [class.opacity-50]="isReordering()"
                     aria-grabbed="false"
                     [attr.aria-label]="'Chapter ' + chap.order + ': ' + chap.title + '. Press up/down arrows to reorder.'">
                  
                  <div class="p-4 text-slate-500" cdkDragHandle
                       [class.cursor-not-allowed]="isReordering() || bookState.contextualSearchTerm().length > 0">
                     <app-icon name="solid-bars-3-20" class="w-5 h-5"></app-icon>
                  </div>
                  
                  <div class="pr-4 py-4 mr-4 overflow-hidden flex-grow cursor-pointer" (click)="openEditor(chap)"> 
                     <h3 class="text-lg font-semibold text-slate-800 dark:text-white truncate">{{ chap.order }}. {{ chap.title }}</h3> 
                     <p class="text-sm text-slate-600 dark:text-slate-400 mt-1"> 
                        {{ countWords(chap.content) }} words
                     </p>
                     @if (getCharacterNames(chap.characterIds); as charNames) {
                        @if (charNames.length > 0) {
                            <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-600 dark:text-slate-400" title="Characters">
                                <app-icon name="solid-users-20" class="w-5 h-5 text-gray-500"></app-icon>
                                <span class="truncate">{{ charNames.join(', ') }}</span>
                            </div>
                        }
                     }
                  </div>

                  <div class="flex-shrink-0 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                     <button [disabled]="isReordering()" (click)="openEditModal(chap); $event.stopPropagation()" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Edit Chapter Title">
                       <app-icon name="solid-pencil-20" class="w-5 h-5"></app-icon>
                     </button>
                     <button [disabled]="isReordering()" (click)="deleteChapter(chap.id!, chap.title); $event.stopPropagation()" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Delete Chapter">
                        <app-icon name="solid-trash-20" class="w-5 h-5"></app-icon>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           @if (bookState.contextualSearchTerm()) {
             <p class="text-center text-gray-500 dark:text-gray-400 py-6">
               No chapters found for "{{ bookState.contextualSearchTerm() }}".
             </p>
           } @else {
             <p class="text-center text-gray-500 dark:text-gray-400 py-6">No chapters yet. Click the button above to start your manuscript!</p>
           }
         }
      }

      @if (showModal()) {
        <app-add-chapter-modal
          [show]="showModal()" 
          [chapterToEdit]="editingChapter()"
          (closeModal)="closeModal()">
        </app-add-chapter-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChapterListComponent {
  public bookState = inject(CurrentBookStateService); 
  private router: Router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  
  @ViewChild('chapterList') chapterList!: CdkDropList<IChapter[]>;

  showModal: WritableSignal<boolean> = signal(false);
  editingChapter: WritableSignal<IChapter | null> = signal(null);
  isReordering: WritableSignal<boolean> = signal(false);

  openAddModal(): void {
    this.editingChapter.set(null); 
    this.showModal.set(true);
  }

  openEditModal(chapter: IChapter): void {
    this.editingChapter.set(chapter); 
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  deleteChapter(id: number, name: string): void {
    this.confirmationService.requestConfirmation({
      message: `Yakin ingin menghapus bab "${name}"?`,
      onConfirm: () => this.bookState.deleteChapter(id)
    });
  }

  openEditor(chapter: IChapter): void {
     const bookId = this.bookState.currentBookId();
     if (bookId && chapter.id) {
       this.router.navigate(['/book', bookId, 'write', chapter.id]);
     }
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

  getCharacterNames(characterIds: number[]): string[] {
    if (!characterIds || characterIds.length === 0) {
      return [];
    }
    const charMap = this.bookState.characterMap();
    return characterIds
      .map(id => charMap.get(id)?.name)
      .filter((name): name is string => !!name);
  }

  onMoveItem(chapter: IChapter, event: KeyboardEvent): void {
      if (this.isReordering() || this.bookState.contextualSearchTerm().length > 0) return;

      const direction = event.key;
      const chapters = this.bookState.chapters();
      const currentIndex = chapters.findIndex(c => c.id === chapter.id);
      
      let newIndex = -1;

      if (direction === 'ArrowUp' && currentIndex > 0) {
          newIndex = currentIndex - 1;
      } else if (direction === 'ArrowDown' && currentIndex < chapters.length - 1) {
          newIndex = currentIndex + 1;
      }

      if (newIndex !== -1) {
          event.preventDefault(); // Prevent page scrolling
          
          const fakeDropEvent: CdkDragDrop<IChapter[]> = {
              currentIndex: newIndex,
              previousIndex: currentIndex,
              container: this.chapterList,
              previousContainer: this.chapterList,
              item: null as any,
              isPointerOverContainer: true,
              distance: { x: 0, y: 0 }
          } as CdkDragDrop<IChapter[]>;

          this.onDrop(fakeDropEvent);

          setTimeout(() => {
              const items = this.chapterList.element.nativeElement.querySelectorAll('[cdkdrag]');
              if (items[newIndex]) {
                  (items[newIndex] as HTMLElement).focus();
              }
          }, 50);
      }
  }

  onDrop(event: CdkDragDrop<IChapter[]>): void {
    if (this.isReordering()) return;

    const currentChapters = [...this.bookState.chapters()];
    
    const movedItem = this.bookState.filteredChapters()[event.previousIndex];
    const previousIndexInFull = currentChapters.findIndex(c => c.id === movedItem.id);
    
    currentChapters.splice(previousIndexInFull, 1);
    
    const nextItemInFiltered = this.bookState.filteredChapters()[event.currentIndex];
    const currentIndexInFull = nextItemInFiltered ? currentChapters.findIndex(c => c.id === nextItemInFiltered.id) : currentChapters.length;

    currentChapters.splice(currentIndexInFull, 0, movedItem);

    const reorderedChapters = currentChapters.map((chapter, index) => ({
      ...chapter,
      order: index + 1
    }));
    
    this.isReordering.set(true);
    
    this.bookState.reorderChapters(reorderedChapters)
        .catch(err => {
            console.error("Failed to save chapter order:", err);
        })
        .finally(() => {
            this.isReordering.set(false);
        });
  }
}