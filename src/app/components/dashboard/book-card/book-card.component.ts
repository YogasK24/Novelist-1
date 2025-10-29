// src/app/components/dashboard/book-card/book-card.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { IBook } from '../../../../types/data';
import { BookStateService } from '../../../state/book-state.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule],
  template: `
    <div
      class="group relative block bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg shadow-lg dark:shadow-xl dark:shadow-black/25 hover:ring-purple-500 dark:hover:ring-purple-400 transition-all duration-300 overflow-hidden h-full flex flex-col p-4">

      <div class="flex-grow">
        <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
          {{ book().title }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ book().wordCount | number }} words
        </p>
      </div>
      
      <p class="text-xs text-slate-400 dark:text-slate-400 mt-2">
        Modified: {{ book().lastModified | date:'shortDate' }}
      </p>

      <div class="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button (click)="onSetTarget($event)"
          class="text-slate-500 hover:text-green-500 dark:text-slate-400 dark:hover:text-green-400 p-1.5 bg-slate-100/60 dark:bg-slate-700/60 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500"
          aria-label="Set Daily Target">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12a3 3 0 106 0 3 3 0 00-6 0z" />
          </svg>
        </button>
        <button (click)="onEdit($event)"
          class="text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 p-1.5 bg-slate-100/60 dark:bg-slate-700/60 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
          aria-label="Edit Judul">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /> </svg>
        </button>
        <button (click)="onDelete($event)"
          class="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 p-1.5 bg-slate-100/60 dark:bg-slate-700/60 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500"
          aria-label="Hapus Buku">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>
        </button>
      </div>
       <!-- Tautan overlay untuk seluruh kartu -->
      <a [routerLink]="['/book', book().id]" class="absolute inset-0" [attr.aria-label]="'Open ' + book().title"></a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCardComponent {
  book = input.required<IBook>(); 
  editClicked = output<IBook>();
  setTargetClicked = output<IBook>();

  private readonly bookState = inject(BookStateService);
  
  onSetTarget(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.setTargetClicked.emit(this.book());
  }

  onEdit(event: MouseEvent): void {
    // Mencegah navigasi saat tombol edit diklik
    event.preventDefault();
    event.stopPropagation();
    this.editClicked.emit(this.book());
  }

  onDelete(event: MouseEvent): void {
    // Mencegah navigasi saat tombol hapus diklik
    event.preventDefault();
    event.stopPropagation();
    const currentBook = this.book();
    if (window.confirm(`Yakin ingin menghapus "${currentBook.title}" dan semua datanya?`)) {
        if(currentBook.id) {
            this.bookState.deleteBook(currentBook.id);
        }
    }
  }
}