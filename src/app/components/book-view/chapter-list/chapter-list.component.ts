// src/app/components/book-view/chapter-list/chapter-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { CurrentBookStateService } from '../../../state/current-book-state.service'; 
import type { IChapter } from '../../../../types/data';
import { AddChapterModalComponent } from '../add-chapter-modal/add-chapter-modal.component';

@Component({
  selector: 'app-chapter-list-tab',
  standalone: true,
  imports: [CommonModule, AddChapterModalComponent],
  template: `
    <div>
      <div class="flex justify-between items-center mb-4 gap-4">
          <p class="text-sm text-gray-400">Kelola bab Anda di sini, atau klik 'Write' di navigasi bawah untuk masuk ke mode editor.</p>
          <button 
            (click)="openAddModal()"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150 whitespace-nowrap">
            + Tambah Bab
          </button>
      </div>


      @if (bookState.isLoading()) {
        <div class="flex justify-center items-center py-6"> <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div> </div>
      } @else if (bookState.chapters(); as chapters) {
         @if (chapters.length > 0) {
            <div class="space-y-3">
              @for (chap of chapters; track chap.id) {
                <div class="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start group hover:bg-gray-700/80 transition cursor-pointer" 
                     (click)="openEditor(chap)">

                  <div class="mr-4 overflow-hidden flex-grow"> 
                     <h3 class="text-lg font-semibold text-white truncate">{{ chap.order }}. {{ chap.title }}</h3> 
                     <p class="text-sm text-gray-400 mt-1"> 
                        {{ countWords(chap.content) }} kata
                     </p>
                     @if (getCharacterNames(chap.characterIds); as charNames) {
                        @if (charNames.length > 0) {
                            <div class="flex items-center gap-1.5 mt-2 text-xs text-gray-400" title="Karakter">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                <span class="truncate">{{ charNames.join(', ') }}</span>
                            </div>
                        }
                     }
                  </div>

                  <div class="flex-shrink-0 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button (click)="openEditModal(chap); $event.stopPropagation()" class="text-blue-400 hover:text-blue-300 p-1" aria-label="Edit Judul Bab">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /> </svg>
                     </button>
                     <button (click)="deleteChapter(chap.id!, chap.title); $event.stopPropagation()" class="text-red-400 hover:text-red-300 p-1" aria-label="Hapus Bab">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           <p class="text-center text-gray-500 py-6">Belum ada bab. Klik tombol di atas untuk memulai naskahmu!</p>
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
export class ChapterListComponent implements OnInit {
  public bookState = inject(CurrentBookStateService); 
  private router = inject(Router);
  
  showModal: WritableSignal<boolean> = signal(false);
  editingChapter: WritableSignal<IChapter | null> = signal(null);

  ngOnInit(): void {
    const bookId = this.bookState.currentBookId();
    if (bookId !== null) {
        this.bookState.loadChapters(bookId);
    }
  }

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
    if (window.confirm(`Yakin ingin menghapus bab "${name}"?`)) {
      this.bookState.deleteChapter(id).catch(err => console.error("Gagal menghapus:", err));
    }
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
      // Handle Quill JSON content
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

    // Fallback for plain text
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
}