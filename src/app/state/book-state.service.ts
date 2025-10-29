// src/app/state/book-state.service.ts
// GANTI SEMUA ISI FILE INI (MIGRASI SIGNALS)

import { Injectable, inject, signal } from '@angular/core';
import { DatabaseService } from './database.service'; 
import type { IBook } from '../../types/data';

@Injectable({
  providedIn: 'root'
})
export class BookStateService {
  private readonly dbService = inject(DatabaseService);

  // --- STATE PRIMER (Writable Signals) ---
  readonly books = signal<IBook[]>([]);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    // Langsung muat buku saat service pertama kali dibuat
    this.fetchBooks(); 
  }

  // --- Actions (Metode Publik) ---

  async fetchBooks(): Promise<void> {
    this.isLoading.set(true); // Update state loading
    try {
      const books = await this.dbService.getAllBooks();
      this.books.set(books); // Update state buku
    } catch (error) {
      console.error("Gagal fetch books:", error);
      this.books.set([]); // Reset jika gagal
    } finally {
      this.isLoading.set(false); // Update state loading selesai
    }
  }

  async addNewBook(title: string): Promise<void> {
    this.isLoading.set(true); 
    try {
      const newBookId = await this.dbService.addBook(title);
      if (newBookId !== undefined) {
        await this.fetchBooks(); // Muat ulang daftar setelah berhasil
      }
    } catch (error) {
      console.error("Gagal menambah buku:", error);
    } finally {
       this.isLoading.set(false);
    }
  }

  async deleteBook(bookId: number): Promise<void> {
    this.isLoading.set(true); 
    try {
      await this.dbService.deleteBookAndData(bookId);
      // Update state secara optimis
      this.books.update(currentBooks => currentBooks.filter(book => book.id !== bookId));
    } catch (error) {
      console.error("Gagal menghapus buku:", error);
      await this.fetchBooks(); // Jika gagal, fetch ulang untuk konsistensi
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateBookTitle(bookId: number, newTitle: string): Promise<void> {
     this.isLoading.set(true);
    try {
      await this.dbService.updateBookTitle(bookId, newTitle);
      // Update state secara optimis
      this.books.update(currentBooks =>
        currentBooks.map(book => 
          book.id === bookId 
            ? { ...book, title: newTitle, lastModified: new Date() } 
            : book
        )
      );
    } catch (error) {
      console.error("Gagal update judul buku:", error);
      await this.fetchBooks();
    } finally {
        this.isLoading.set(false);
    }
  }

  // <-- AKSI BARU UNTUK UPDATE STATS
  async updateBookStats(bookId: number, data: Partial<Pick<IBook, 'dailyWordTarget' | 'wordCount'>>): Promise<void> {
    this.isLoading.set(true);
   try {
     await this.dbService.updateBookStats(bookId, data);
     // Update state secara optimis
     this.books.update(currentBooks =>
       currentBooks.map(book =>
         book.id === bookId
           ? { ...book, ...data, lastModified: new Date() }
           : book
       )
     );
   } catch (error) {
     console.error("Gagal update statistik buku:", error);
     await this.fetchBooks();
   } finally {
       this.isLoading.set(false);
   }
 }
 
  /**
   * Memperbarui buku dalam daftar state secara optimis.
   * Digunakan untuk sinkronisasi dari service lain (misal: CurrentBookStateService).
   */
  updateBookInList(bookId: number, data: Partial<Pick<IBook, 'wordCount' | 'dailyWordTarget'>>): void {
    this.books.update(currentBooks =>
      currentBooks.map(book =>
        book.id === bookId
          ? { ...book, ...data, lastModified: new Date() }
          : book
      )
    );
  }
}