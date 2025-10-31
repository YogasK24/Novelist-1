// src/app/state/book-state.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { DatabaseService } from './database.service'; 
import type { IBook, IWritingLog } from '../../types/data';
import { NotificationService } from './notification.service'; 
import { SettingsService } from './settings.service'; // <-- 1. IMPORT

// NEW: Define IBook type with additional properties for UI
interface IBookWithStats extends IBook {
  chapterCount?: number;
  characterCount?: number;
  dailyProgressPercentage?: number; // <-- Add daily progress
}

// NEW: Define Type for Sorting
export type SortMode = 'title' | 'lastModified';
export type SortDirection = 'asc' | 'desc';
export interface SortConfig {
  mode: SortMode;
  direction: SortDirection;
}

// NEW: Define Type for View
export type ViewMode = 'grid' | 'list';


@Injectable({
  providedIn: 'root'
})
export class BookStateService {
  private readonly dbService = inject(DatabaseService);
  private readonly notificationService = inject(NotificationService); 
  private readonly settingsService = inject(SettingsService); // <-- 2. INJECT

  // --- PRIMARY STATE (Use NEW Type) ---
  readonly books = signal<IBookWithStats[]>([]); // <-- Use IBookWithStats
  readonly isLoading = signal<boolean>(false);
  readonly showArchived = signal<boolean>(false); // <-- NEW

  // --- 3. UBAH INISIALISASI STATE (BACA DARI SETTINGS) ---
  
  // State untuk Sorting
  readonly sortConfig = signal<SortConfig>(this.getInitialSortConfig());

  // State untuk View
  readonly viewMode = signal<ViewMode>(this.settingsService.dashboardViewMode());

  // --- NEW: Computed Signal for Displaying Sorted Books ---
  readonly sortedBooks = computed(() => {
    const books = this.books();
    const config = this.sortConfig();
    const showArchived = this.showArchived();

    // 1. Filter out archived books if not shown
    const filteredBooks = books.filter(book => showArchived || !book.isArchived);
    
    // 2. Sort the filtered books
    return [...filteredBooks].sort((a, b) => {
      // Primary Sort: Pinned books always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Secondary Sort: Based on user selection
      let valA: string | number | Date;
      let valB: string | number | Date;

      // Determine the value to be sorted
      if (config.mode === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else {
        // 'lastModified'
        valA = a.lastModified;
        valB = b.lastModified;
      }

      // Determine the sorting direction
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
  
  // 4. BUAT FUNGSI HELPER UNTUK INISIALISASI SORT
  private getInitialSortConfig(): SortConfig {
    const defaultMode = this.settingsService.dashboardSortMode();
    return {
      mode: defaultMode,
      direction: defaultMode === 'title' ? 'asc' : 'desc'
    };
  }

  // --- 5. MODIFIKASI FUNGSI SETTER (UNTUK MENYIMPAN) ---
  
  // Method to Change View
  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.settingsService.dashboardViewMode.set(mode); // <-- SIMPAN PREFERENSI
  }
  
  // --- NEW: Method to toggle archived visibility ---
  toggleShowArchived(): void {
    this.showArchived.update(v => !v);
  }

  // Method to Change Sorting
  setSort(mode: SortMode) {
    this.sortConfig.update(currentConfig => {
      let newConfig: SortConfig;
      if (currentConfig.mode === mode) {
        // If the mode is the same, reverse the direction
        newConfig = { ...currentConfig, direction: currentConfig.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        // If it's a new mode, set the default direction
        newConfig = {
          mode: mode,
          direction: mode === 'title' ? 'asc' : 'desc' // Title A-Z, Newest Date
        };
      }
      
      // SIMPAN PREFERENSI (hanya mode-nya)
      this.settingsService.dashboardSortMode.set(newConfig.mode);
      
      return newConfig;
    });
  }

  // --- Actions (Public Methods) ---

  async fetchBooks(): Promise<void> {
    this.isLoading.set(true); 
    try {
      const basicBooks = await this.dbService.getAllBooks();
      
      // NEW: Fetch additional stats for each book
      const booksWithStats: IBookWithStats[] = await Promise.all(
        basicBooks.map(async (book) => {
          if (book.id === undefined) return book; // Safety check
          
          try {
            const [chapters, characters, logs] = await Promise.all([
              this.dbService.getChaptersByBookId(book.id),
              this.dbService.getCharactersByBookId(book.id),
              this.dbService.getWritingLogsByBookId(book.id) // Fetch daily logs
            ]);

            // Calculate daily progress
            const today = new Date().toISOString().slice(0, 10);
            const todayLog = logs.find(log => log.date === today);
            const wordsToday = todayLog ? todayLog.wordCountAdded : 0;
            const target = book.dailyWordTarget ?? 0;
            const dailyProgress = target <= 0 ? 0 : Math.min(100, Math.floor((wordsToday / target) * 100));

            return {
              ...book,
              chapterCount: chapters.length,
              characterCount: characters.length,
              dailyProgressPercentage: dailyProgress // Save progress
            };
          } catch (statError) {
            console.error(`Failed to fetch stats for book ID ${book.id}:`, statError);
            return book; // Return the basic book if fetching stats fails
          }
        })
      );

      this.books.set(booksWithStats); // Update book state with stats
      
    } catch (error) {
      console.error("Failed to fetch books:", error);
      this.notificationService.error("Failed to load novel list."); 
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
        this.notificationService.success(`Novel "${title}" created successfully!`); 
        await this.fetchBooks(); // Reload the list (will automatically fetch stats)
      } else {
        throw new Error("Book ID is not defined.");
      }
    } catch (error) {
      console.error("Failed to add book:", error);
      this.notificationService.error("Failed to create new novel."); 
    } finally {
       this.isLoading.set(false);
    }
  }

  async deleteBook(bookId: number): Promise<void> {
    this.isLoading.set(true); 
    try {
      const bookToDelete = this.books().find(b => b.id === bookId);
      const title = bookToDelete?.title ?? 'Book';

      await this.dbService.deleteBookAndData(bookId);
      // Optimistically update state (remove from list)
      this.books.update(currentBooks => currentBooks.filter(book => book.id !== bookId));
      this.notificationService.success(`Novel "${title}" was deleted successfully.`); 
    } catch (error) {
      console.error("Failed to delete book:", error);
      this.notificationService.error("Failed to delete novel."); 
      await this.fetchBooks(); // Re-fetch if it fails (including stats)
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateBookTitle(bookId: number, newTitle: string): Promise<void> {
     this.isLoading.set(true);
    try {
      await this.dbService.updateBookTitle(bookId, newTitle);
      // Optimistically update state (only title and lastModified)
      this.books.update(currentBooks =>
        currentBooks.map(book => 
          book.id === bookId 
            ? { ...book, title: newTitle, lastModified: new Date() } 
            : book
        )
      );
      this.notificationService.success(`Novel title changed to "${newTitle}".`); 
    } catch (error) {
      console.error("Failed to update book title:", error);
      this.notificationService.error("Failed to update novel title."); 
      await this.fetchBooks(); // Re-fetch if it fails (including stats)
    } finally {
        this.isLoading.set(false);
    }
  }

  async updateBookStats(bookId: number, data: Partial<Pick<IBook, 'dailyWordTarget' | 'wordCount'>>): Promise<void> {
   try {
     await this.dbService.updateBookStats(bookId, data);
     // Optimistically update state (including recalculating progress if target changes)
     this.books.update(currentBooks =>
       currentBooks.map(book => {
         if (book.id === bookId) {
           const updatedBook = { ...book, ...data, lastModified: new Date() };
           // Recalculate progress if target changes
           if (data.dailyWordTarget !== undefined) {
             const wordsToday = book.dailyProgressPercentage !== undefined ? ( (book.dailyProgressPercentage/100) * (book.dailyWordTarget || 0)) : 0; // Estimate today's words
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
         this.notificationService.success(`Daily target saved successfully.`);
     }
   } catch (error) {
     console.error("Failed to update book stats:", error);
     this.notificationService.error("Failed to save target/stats."); 
     await this.fetchBooks(); // Re-fetch if it fails (including stats)
   }
 }
 
  // --- NEW: Methods for Pinning and Archiving ---

  async pinBook(bookId: number, pin: boolean): Promise<void> {
    try {
      await this.dbService.updateBookFlags(bookId, { isPinned: pin });
      this.books.update(currentBooks =>
        currentBooks.map(book =>
          book.id === bookId ? { ...book, isPinned: pin, lastModified: new Date() } : book
        )
      );
      this.notificationService.success(pin ? "Novel pinned." : "Novel unpinned.");
    } catch (error) {
      console.error("Failed to update pin status:", error);
      this.notificationService.error("Failed to update pin status.");
    }
  }

  async archiveBook(bookId: number, archive: boolean): Promise<void> {
    try {
      await this.dbService.updateBookFlags(bookId, { isArchived: archive });
      this.books.update(currentBooks =>
        currentBooks.map(book =>
          book.id === bookId ? { ...book, isArchived: archive, lastModified: new Date() } : book
        )
      );
      this.notificationService.success(archive ? "Novel archived." : "Novel unarchived.");
    } catch (error) {
      console.error("Failed to update archive status:", error);
      this.notificationService.error("Failed to update archive status.");
    }
  }

  /**
   * Optimistically updates a book in the state list.
   * Used for synchronization from other services (e.g., CurrentBookStateService).
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