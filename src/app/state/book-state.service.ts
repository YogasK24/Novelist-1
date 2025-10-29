// src/app/state/book-state.service.ts

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// FIX: Corrected the import path for DatabaseService.
// The service is located in the same 'state' directory, not '../services'.
// This resolves TypeScript errors where 'dbService' was treated as 'unknown'.
import { DatabaseService } from './database.service'; 
import type { IBook } from '../../types/data';

@Injectable({
  providedIn: 'root'
})
export class BookStateService {
  private readonly dbService = inject(DatabaseService);

  // --- State Internal (Private BehaviorSubjects) ---
  private readonly _books$ = new BehaviorSubject<IBook[]>([]);
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);

  // --- State Publik (Public Observables) ---
  // Komponen akan subscribe ke sini
  readonly books$: Observable<IBook[]> = this._books$.asObservable();
  readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();

  constructor() {
    // Langsung muat buku saat service pertama kali dibuat
    this.fetchBooks(); 
  }

  // --- Actions (Metode Publik) ---

  async fetchBooks(): Promise<void> {
    this._isLoading$.next(true); // Update state loading
    try {
      const books = await this.dbService.getAllBooks();
      this._books$.next(books); // Update state buku
    } catch (error) {
      console.error("Gagal fetch books:", error);
      this._books$.next([]); // Reset jika gagal
    } finally {
      this._isLoading$.next(false); // Update state loading selesai
    }
  }

  async addNewBook(title: string): Promise<void> {
    this._isLoading$.next(true); // Bisa tambahkan loading spesifik add
    try {
      const newBookId = await this.dbService.addBook(title);
      if (newBookId !== undefined) {
        await this.fetchBooks(); // Muat ulang daftar setelah berhasil
      }
    } catch (error) {
      console.error("Gagal menambah buku:", error);
    } finally {
       this._isLoading$.next(false); // Selesai loading add
    }
  }

  async deleteBook(bookId: number): Promise<void> {
    this._isLoading$.next(true); // Loading spesifik delete
    try {
      await this.dbService.deleteBookAndData(bookId);
      // Update state secara optimis (tanpa fetch ulang)
      const currentBooks = this._books$.getValue();
      this._books$.next(currentBooks.filter(book => book.id !== bookId));
    } catch (error) {
      console.error("Gagal menghapus buku:", error);
      // Jika gagal, mungkin fetch ulang untuk konsistensi
      await this.fetchBooks(); 
    } finally {
      this._isLoading$.next(false);
    }
  }

  async updateBookTitle(bookId: number, newTitle: string): Promise<void> {
     this._isLoading$.next(true); // Loading spesifik update
    try {
      await this.dbService.updateBookTitle(bookId, newTitle);
      // Update state secara optimis
      const currentBooks = this._books$.getValue();
      this._books$.next(
        currentBooks.map(book => 
          book.id === bookId 
            ? { ...book, title: newTitle, lastModified: new Date() } 
            : book
        )
      );
    } catch (error) {
      console.error("Gagal update judul buku:", error);
      await this.fetchBooks(); // Fetch ulang jika gagal
    } finally {
        this._isLoading$.next(false);
    }
  }
}
