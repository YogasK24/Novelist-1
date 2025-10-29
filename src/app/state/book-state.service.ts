// src/app/state/book-state.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { DatabaseService } from './database.service'; 
import type { IBook } from '../../types/data';
import { NotificationService } from './notification.service'; // <-- Import BARU

@Injectable({
  providedIn: 'root'
})
export class BookStateService {
  private readonly dbService = inject(DatabaseService);
  private readonly notificationService = inject(NotificationService); // <-- Inject BARU

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
      this.notificationService.error("Gagal memuat daftar novel."); // <-- Error Notif
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
        this.notificationService.success(`Novel "${title}" berhasil dibuat!`); // <-- Success Notif
        await this.fetchBooks(); // Muat ulang daftar setelah berhasil
      } else {
        throw new Error("ID buku tidak terdefinisi.");
      }
    } catch (error) {
      console.error("Gagal menambah buku:", error);
      this.notificationService.error("Gagal membuat novel baru."); // <-- Error Notif
    } finally {
       this.isLoading.set(false);
    }
  }

  async deleteBook(bookId: number): Promise<void> {
    this.isLoading.set(true); 
    try {
      // Dapatkan nama buku sebelum dihapus untuk notifikasi
      const bookToDelete = this.books().find(b => b.id === bookId);
      const title = bookToDelete?.title ?? 'Buku';

      await this.dbService.deleteBookAndData(bookId);
      // Update state secara optimis
      this.books.update(currentBooks => currentBooks.filter(book => book.id !== bookId));
      this.notificationService.success(`Novel "${title}" berhasil dihapus.`); // <-- Success Notif
    } catch (error) {
      console.error("Gagal menghapus buku:", error);
      this.notificationService.error("Gagal menghapus novel."); // <-- Error Notif
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
      this.notificationService.success(`Judul novel diubah menjadi "${newTitle}".`); // <-- Success Notif
    } catch (error) {
      console.error("Gagal update judul buku:", error);
      this.notificationService.error("Gagal memperbarui judul novel."); // <-- Error Notif
      await this.fetchBooks();
    } finally {
        this.isLoading.set(false);
    }
  }

  // <-- AKSI BARU UNTUK UPDATE STATS
  async updateBookStats(bookId: number, data: Partial<Pick<IBook, 'dailyWordTarget' | 'wordCount'>>): Promise<void> {
    // Tidak perlu set loading global untuk ini
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
     // Jika hanya target yang diubah, berikan notifikasi sukses
     if (data.dailyWordTarget !== undefined) {
         this.notificationService.success(`Target harian berhasil disimpan.`);
     }
   } catch (error) {
     console.error("Gagal update statistik buku:", error);
     this.notificationService.error("Gagal menyimpan target/statistik."); // <-- Error Notif
     await this.fetchBooks();
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