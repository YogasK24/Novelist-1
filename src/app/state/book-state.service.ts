// src/app/state/book-state.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { DatabaseService } from './database.service'; 
import type { IBook, IWritingLog } from '../../types/data';
import { NotificationService } from './notification.service'; 

// BARU: Definisikan tipe IBook dengan properti tambahan untuk UI
interface IBookWithStats extends IBook {
  chapterCount?: number;
  characterCount?: number;
  dailyProgressPercentage?: number; // <-- Tambah progress harian
}

// BARU: Definisikan Tipe untuk Sorting
export type SortMode = 'title' | 'lastModified';
export type SortDirection = 'asc' | 'desc';
export interface SortConfig {
  mode: SortMode;
  direction: SortDirection;
}

// BARU: Definisikan Tipe untuk View
export type ViewMode = 'grid' | 'list';


@Injectable({
  providedIn: 'root'
})
export class BookStateService {
  private readonly dbService = inject(DatabaseService);
  private readonly notificationService = inject(NotificationService); 

  // --- STATE PRIMER (Gunakan Tipe BARU) ---
  readonly books = signal<IBookWithStats[]>([]); // <-- Gunakan IBookWithStats
  readonly isLoading = signal<boolean>(false);

  // --- BARU: State untuk Sorting ---
  readonly sortConfig = signal<SortConfig>({
    mode: 'lastModified', // Default urutkan berdasarkan terbaru
    direction: 'desc'
  });

  // --- BARU: State untuk View ---
  readonly viewMode = signal<ViewMode>('grid');

  // --- BARU: Computed Signal untuk Menampilkan Buku Terurut ---
  readonly sortedBooks = computed(() => {
    const books = this.books();
    const config = this.sortConfig();

    // Buat salinan array agar tidak mengubah sinyal asli
    return [...books].sort((a, b) => {
      let valA: string | number | Date;
      let valB: string | number | Date;

      // Tentukan nilai yang akan diurutkan
      if (config.mode === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else {
        // 'lastModified'
        valA = a.lastModified;
        valB = b.lastModified;
      }

      // Tentukan arah pengurutan
      if (config.direction === 'asc') {
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      } else {
        return valA > valB ? -1 : valA < valB ? 1 : 0;
      }
    });
  });

  constructor() {
    this.fetchBooks(); 
  }

  // --- BARU: Method untuk Mengubah View ---
  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  // --- BARU: Method untuk Mengubah Sorting ---
  setSort(mode: SortMode) {
    this.sortConfig.update(currentConfig => {
      if (currentConfig.mode === mode) {
        // Jika mode sama, balik arahnya
        return { ...currentConfig, direction: currentConfig.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        // Jika mode baru, set default direction
        return {
          mode: mode,
          direction: mode === 'title' ? 'asc' : 'desc' // Judul A-Z, Tanggal Terbaru
        };
      }
    });
  }

  // --- Actions (Metode Publik) ---

  async fetchBooks(): Promise<void> {
    this.isLoading.set(true); 
    try {
      const basicBooks = await this.dbService.getAllBooks();
      
      // BARU: Ambil statistik tambahan untuk setiap buku
      const booksWithStats: IBookWithStats[] = await Promise.all(
        basicBooks.map(async (book) => {
          if (book.id === undefined) return book; // Safety check
          
          try {
            const [chapters, characters, logs] = await Promise.all([
              this.dbService.getChaptersByBookId(book.id),
              this.dbService.getCharactersByBookId(book.id),
              this.dbService.getWritingLogsByBookId(book.id) // Ambil log harian
            ]);

            // Hitung progress harian
            const today = new Date().toISOString().slice(0, 10);
            const todayLog = logs.find(log => log.date === today);
            const wordsToday = todayLog ? todayLog.wordCountAdded : 0;
            const target = book.dailyWordTarget ?? 0;
            const dailyProgress = target <= 0 ? 0 : Math.min(100, Math.floor((wordsToday / target) * 100));

            return {
              ...book,
              chapterCount: chapters.length,
              characterCount: characters.length,
              dailyProgressPercentage: dailyProgress // Simpan progress
            };
          } catch (statError) {
            console.error(`Gagal mengambil statistik untuk buku ID ${book.id}:`, statError);
            return book; // Kembalikan buku dasar jika gagal ambil statistik
          }
        })
      );

      this.books.set(booksWithStats); // Update state buku dengan statistik
      
    } catch (error) {
      console.error("Gagal fetch books:", error);
      this.notificationService.error("Gagal memuat daftar novel."); 
      this.books.set([]); 
    } finally {
      this.isLoading.set(false); 
    }
  }

  async addNewBook(title: string): Promise<void> {
    this.isLoading.set(true); 
    try {
      const newBookId = await this.dbService.addBook(title);
      if (newBookId !== undefined) {
        this.notificationService.success(`Novel "${title}" berhasil dibuat!`); 
        await this.fetchBooks(); // Muat ulang daftar (akan otomatis mengambil stats)
      } else {
        throw new Error("ID buku tidak terdefinisi.");
      }
    } catch (error) {
      console.error("Gagal menambah buku:", error);
      this.notificationService.error("Gagal membuat novel baru."); 
    } finally {
       this.isLoading.set(false);
    }
  }

  async deleteBook(bookId: number): Promise<void> {
    this.isLoading.set(true); 
    try {
      const bookToDelete = this.books().find(b => b.id === bookId);
      const title = bookToDelete?.title ?? 'Buku';

      await this.dbService.deleteBookAndData(bookId);
      // Update state secara optimis (hapus dari daftar)
      this.books.update(currentBooks => currentBooks.filter(book => book.id !== bookId));
      this.notificationService.success(`Novel "${title}" berhasil dihapus.`); 
    } catch (error) {
      console.error("Gagal menghapus buku:", error);
      this.notificationService.error("Gagal menghapus novel."); 
      await this.fetchBooks(); // Fetch ulang jika gagal (termasuk stats)
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateBookTitle(bookId: number, newTitle: string): Promise<void> {
     this.isLoading.set(true);
    try {
      await this.dbService.updateBookTitle(bookId, newTitle);
      // Update state secara optimis (hanya judul dan lastModified)
      this.books.update(currentBooks =>
        currentBooks.map(book => 
          book.id === bookId 
            ? { ...book, title: newTitle, lastModified: new Date() } 
            : book
        )
      );
      this.notificationService.success(`Judul novel diubah menjadi "${newTitle}".`); 
    } catch (error) {
      console.error("Gagal update judul buku:", error);
      this.notificationService.error("Gagal memperbarui judul novel."); 
      await this.fetchBooks(); // Fetch ulang jika gagal (termasuk stats)
    } finally {
        this.isLoading.set(false);
    }
  }

  async updateBookStats(bookId: number, data: Partial<Pick<IBook, 'dailyWordTarget' | 'wordCount'>>): Promise<void> {
   try {
     await this.dbService.updateBookStats(bookId, data);
     // Update state secara optimis (termasuk hitung ulang progress jika target berubah)
     this.books.update(currentBooks =>
       currentBooks.map(book => {
         if (book.id === bookId) {
           const updatedBook = { ...book, ...data, lastModified: new Date() };
           // Hitung ulang progress jika target berubah
           if (data.dailyWordTarget !== undefined) {
             const wordsToday = book.dailyProgressPercentage !== undefined ? ( (book.dailyProgressPercentage/100) * (book.dailyWordTarget || 0)) : 0; // Perkirakan kata hari ini
             const newTarget = updatedBook.dailyWordTarget ?? 0;
             updatedBook.dailyProgressPercentage = newTarget <= 0 ? 0 : Math.min(100, Math.floor((wordsToday / newTarget) * 100));
           }
           return updatedBook;
         } else {
           return book;
         }
       })
     );
     
     if (data.dailyWordTarget !== undefined) {
         this.notificationService.success(`Target harian berhasil disimpan.`);
     }
   } catch (error) {
     console.error("Gagal update statistik buku:", error);
     this.notificationService.error("Gagal menyimpan target/statistik."); 
     await this.fetchBooks(); // Fetch ulang jika gagal (termasuk stats)
   }
 }
 
  /**
   * Memperbarui buku dalam daftar state secara optimis.
   * Digunakan untuk sinkronisasi dari service lain (misal: CurrentBookStateService).
   */
  updateBookInList(bookId: number, data: Partial<Pick<IBook, 'wordCount' | 'dailyWordTarget'>>): void {
    this.books.update(currentBooks =>
      currentBooks.map(book => {
        if (book.id === bookId) {
          const updatedBook = { ...book, ...data, lastModified: new Date() };
          // NOTE: This optimistic update for progress can't be fully accurate without fetching logs.
          // The full `fetchBooks` or a refresh will correct it. We just update what we can.
          return updatedBook;
        } else {
          return book;
        }
      })
    );
  }
}
