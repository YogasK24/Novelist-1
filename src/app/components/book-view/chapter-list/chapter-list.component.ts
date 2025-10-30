// src/app/components/book-view/chapter-list/chapter-list.component.ts
import { Component, inject, signal, WritableSignal, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, CdkDropList } from '@angular/cdk/drag-drop';
import { CurrentBookStateService } from '../../../state/current-book-state.service'; 
import type { IChapter } from '../../../../types/data';
import { AddChapterModalComponent } from '../add-chapter-modal/add-chapter-modal.component';

@Component({
  selector: 'app-chapter-list-tab',
  standalone: true,
  imports: [CommonModule, AddChapterModalComponent, DragDropModule], // <-- Tambahkan DragDropModule
  template: `
    <div>
      <div class="flex justify-between items-center mb-4 gap-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Kelola bab Anda di sini, atau klik 'Write' di navigasi bawah untuk masuk ke mode editor.</p>
          <button 
            (click)="openAddModal()"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-150 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-900">
            + Tambah Bab
          </button>
      </div>


      @if (bookState.isLoadingChapters() || isReordering()) {
        <div class="flex justify-center items-center py-6"> 
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 dark:border-purple-600"></div> 
          @if (isReordering()) {
             <span class="ml-3 text-slate-400 dark:text-slate-500">Menyimpan urutan...</span>
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
                     class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-start group hover:bg-slate-100 dark:hover:bg-slate-700/80 transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-purple-500"
                     [class.cursor-grab]="!isReordering() && bookState.contextualSearchTerm().length === 0"
                     [class.cursor-not-allowed]="isReordering() || bookState.contextualSearchTerm().length > 0"
                     [class.opacity-50]="isReordering()"
                     aria-grabbed="false"
                     [attr.aria-label]="'Chapter ' + chap.order + ': ' + chap.title + '. Tekan panah atas/bawah untuk menyusun ulang.'">
                  
                  <div class="p-4 text-slate-500" cdkDragHandle
                       [class.cursor-not-allowed]="isReordering() || bookState.contextualSearchTerm().length > 0">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                       <path fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
                     </svg>
                  </div>
                  
                  <div class="pr-4 py-4 mr-4 overflow-hidden flex-grow cursor-pointer" (click)="openEditor(chap)"> 
                     <h3 class="text-lg font-semibold text-slate-800 dark:text-white truncate">{{ chap.order }}. {{ chap.title }}</h3> 
                     <p class="text-sm text-slate-600 dark:text-slate-400 mt-1"> 
                        {{ countWords(chap.content) }} kata
                     </p>
                     @if (getCharacterNames(chap.characterIds); as charNames) {
                        @if (charNames.length > 0) {
                            <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-600 dark:text-slate-400" title="Karakter">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-500">
                                  <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 8a3 3 0 100-6 3 3 0 000 6zM1.066 16.59a1.5 1.5 0 012.15-1.793A10.953 10.953 0 008 16.5c.343 0 .681-.01 1.014-.03A1.5 1.5 0 0110.8 17.1a10.953 10.953 0 004.784-1.703 1.5 1.5 0 012.15 1.793A12.452 12.452 0 0110 18c-2.43 0-4.72-.667-6.617-1.84a1.5 1.5 0 01-2.317-.57zM14.5 11.5c.204 0 .4-.006.593-.018a1.5 1.5 0 011.628 1.87A10.953 10.953 0 0018 16.5c.343 0 .681-.01 1.014-.03a1.5 1.5 0 011.628 1.87A12.452 12.452 0 0114.5 18c-1.597 0-3.098-.42-4.42-1.155a1.5 1.5 0 01-.416-2.21 1.5 1.5 0 012.21-.416A10.906 10.906 0 0014.5 16.5c.204 0 .4-.006.593-.018a1.5 1.5 0 011.628 1.87A10.953 10.953 0 0018 16.5c.343 0 .681-.01 1.014-.03a1.5 1.5 0 011.628 1.87A12.452 12.452 0 0114.5 18c-2.43 0-4.72-.667-6.617-1.84a1.5 1.5 0 01-2.317-.57z" />
                                </svg>
                                <span class="truncate">{{ charNames.join(', ') }}</span>
                            </div>
                        }
                     }
                  </div>

                  <div class="flex-shrink-0 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                     <button [disabled]="isReordering()" (click)="openEditModal(chap); $event.stopPropagation()" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Edit Judul Bab">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                         <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                       </svg>
                     </button>
                     <button [disabled]="isReordering()" (click)="deleteChapter(chap.id!, chap.title); $event.stopPropagation()" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Hapus Bab">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                          <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.84 0a.75.75 0 01-1.5.06l-.3 7.5a.75.75 0 111.5-.06l.3-7.5z" clip-rule="evenodd" />
                        </svg>
                     </button>
                  </div>
                </div>
              }
            </div>
         } @else {
           @if (bookState.contextualSearchTerm()) {
             <p class="text-center text-gray-500 dark:text-gray-400 py-6">
               Tidak ada bab ditemukan untuk "{{ bookState.contextualSearchTerm() }}".
             </p>
           } @else {
             <p class="text-center text-gray-500 dark:text-gray-500 py-6">Belum ada bab. Klik tombol di atas untuk memulai naskahmu!</p>
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
  // FIX: Property 'navigate' does not exist on type 'unknown'. Explicitly type the injected Router.
  private router: Router = inject(Router);
  
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
    if (window.confirm(`Yakin ingin menghapus bab "${name}"?`)) {
      this.bookState.deleteChapter(id);
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
          event.preventDefault(); // Mencegah scrolling halaman
          
          // 1. Simulasikan drop event (hanya perlu currentIndex dan previousIndex)
          const fakeDropEvent: CdkDragDrop<IChapter[]> = {
              currentIndex: newIndex,
              previousIndex: currentIndex,
              container: this.chapterList,
              previousContainer: this.chapterList,
              item: null as any, // D3 item is not needed for the core logic
              isPointerOverContainer: true,
              distance: { x: 0, y: 0 }
          } as CdkDragDrop<IChapter[]>;

          this.onDrop(fakeDropEvent);

          // 2. Pertahankan fokus pada item yang baru dipindahkan
          setTimeout(() => {
              const items = this.chapterList.element.nativeElement.querySelectorAll('[cdkdrag]');
              if (items[newIndex]) {
                  (items[newIndex] as HTMLElement).focus();
              }
          }, 50);
      }
  }

  onDrop(event: CdkDragDrop<IChapter[]>): void {
    if (this.isReordering()) return; // Cegah double drop

    // Penting: Gunakan daftar asli untuk pengurutan, bukan daftar yang difilter
    const currentChapters = [...this.bookState.chapters()];
    
    // Temukan item yang sebenarnya di daftar asli berdasarkan ID
    const movedItem = this.bookState.filteredChapters()[event.previousIndex];
    const previousIndexInFull = currentChapters.findIndex(c => c.id === movedItem.id);
    
    // Pindahkan item dari posisi lama
    currentChapters.splice(previousIndexInFull, 1);
    
    // Tentukan posisi baru di daftar asli
    // Jika pindah ke bawah, indeks target bisa lebih kecil
    const nextItemInFiltered = this.bookState.filteredChapters()[event.currentIndex];
    const currentIndexInFull = nextItemInFiltered ? currentChapters.findIndex(c => c.id === nextItemInFiltered.id) : currentChapters.length;

    // Sisipkan item di posisi baru
    currentChapters.splice(currentIndexInFull, 0, movedItem);

    const reorderedChapters = currentChapters.map((chapter, index) => ({
      ...chapter,
      order: index + 1
    }));
    
    this.isReordering.set(true); // <-- SET LOADING TRUE
    
    this.bookState.reorderChapters(reorderedChapters)
        .catch(err => {
            console.error("Gagal menyimpan urutan bab:", err);
        })
        .finally(() => {
            this.isReordering.set(false); // <-- SET LOADING FALSE
        });
  }
}