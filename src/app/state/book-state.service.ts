// src/app/state/book-state.service.ts

import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { DatabaseService } from './database.service'; 
import type { IBook, IChapter, ICharacter, IWritingLog, IBookWithStats } from '../../types/data';
import { NotificationService } from './notification.service'; 
import { SettingsService } from './settings.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UiStateService } from './ui-state.service';
import { BookDataSyncService } from './book-data-sync.service';

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
  private readonly settingsService = inject(SettingsService);
  private readonly uiState = inject(UiStateService);
  private readonly bookDataSyncService = inject(BookDataSyncService);

  // --- PRIMARY STATE (Use NEW Type) ---
  readonly books = signal<IBookWithStats[]>([]); // <-- Use IBookWithStats
  readonly isLoading = signal<boolean>(false);
  readonly showArchived = signal<boolean>(false); // <-- NEW
  readonly processingBookId = signal<number | null>(null); // <-- NEW: Untuk loading per-item

  // State untuk Sorting
  readonly sortConfig = signal<SortConfig>(this.getInitialSortConfig());

  // State untuk View
  readonly viewMode = signal<ViewMode>(this.settingsService.dashboardViewMode());

  // --- STATE BARU UNTUK SELEKSI ---
  readonly selectedBookIds = signal<Set<number>>(new Set());

  // --- COMPUTED SIGNAL BARU ---
  readonly selectedBooksCount = computed(() => this.selectedBookIds().size);

  // --- COMPUTED SIGNAL BARU UNTUK AKSI DINAMIS ---
  readonly areAllSelectedBooksArchived = computed(() => {
    const selectedIds = this.selectedBookIds();
    if (selectedIds.size === 0) {
      return false;
    }
    // FIX: Explicitly type the Map to ensure TypeScript correctly infers the value type as IBookWithStats,
    // which resolves the error "Property 'isArchived' does not exist on type 'unknown'".
    const booksMap = new Map<number, IBookWithStats>(this.books().map(book => [book.id!, book]));
    for (const id of selectedIds) {
      const book = booksMap.get(id);
      if (!book || !book.isArchived) {
        return false; // Ditemukan satu yang belum diarsip
      }
    }
    return true; // Semua yang dipilih sudah diarsip
  });


  // --- NEW: Computed Signal for Filtering ---
  readonly filteredBooks = computed(() => {
    const books = this.books();
    const showArchived = this.showArchived();
    return books.filter(book => showArchived || !book.isArchived);
  });
  
  readonly pinnedBooks = computed(() => {
    return this.filteredBooks()
      .filter(b => b.isPinned)
      .sort((a, b) => (a.pinOrder ?? 0) - (b.pinOrder ?? 0));
  });

  readonly unpinnedBooks = computed(() => {
    const books = this.filteredBooks().filter(b => !b.isPinned);
    const config = this.sortConfig();
    
    return [...books].sort((a, b) => {
      let valA: string | number | Date;
      let valB: string | number | Date;

      if (config.mode === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else {
        valA = a.lastModified;
        valB = b.lastModified;
      }

      if (config.direction === 'asc') {
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      } else {
        return valA > valB ? -1 : valA < valB ? 1 : 0;
      }
    });
  });

  // --- NEW: Computed Signal for Displaying Sorted Books ---
  readonly sortedBooks = computed(() => {
    return [...this.pinnedBooks(), ...this.unpinnedBooks()];
  });

  constructor() {
    this.fetchBooks(); 
    
    // --- EFEK BARU ---
    // Saat mode pilih dimatikan, bersihkan item yang dipilih.
    effect(() => {
      if (!this.uiState.isSelectMode()) {
        this.clearBookSelection();
      }
    });

    // --- NEW: Subscribe to synchronization events ---
    this.bookDataSyncService.bookStatsUpdated$.subscribe(({ bookId, stats }) => {
      this.books.update(currentBooks =>
        currentBooks.map(book => {
          if (book.id === bookId) {
            return { ...book, ...stats, lastModified: new Date() };
          }
          return book;
        })
      );
    });

    this.bookDataSyncService.bookCountChanged$.subscribe(({ bookId, countType, change }) => {
      this.books.update(currentBooks =>
        currentBooks.map(book => {
          if (book.id === bookId) {
            const newCount = (book[countType] || 0) + change;
            return { ...book, [countType]: Math.max(0, newCount), lastModified: new Date() };
          }
          return book;
        })
      );
    });
  }
  
  private getInitialSortConfig(): SortConfig {
    const defaultMode = this.settingsService.dashboardSortMode();
    return {
      mode: defaultMode,
      direction: defaultMode === 'title' ? 'asc' : 'desc'
    };
  }
  
  // Method to Change View
  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.settingsService.dashboardViewMode.set(mode);
  }
  
  // --- NEW: Method to toggle archived visibility ---
  toggleShowArchived(): void {
    this.showArchived.update(v => !v);
  }

  /**
   * Resets all dashboard filters to their default "show all" state.
   * This ensures all novels, including archived ones, are visible.
   * If new filters are added to the dashboard (e.g., a text filter),
   * they should also be reset here.
   */
  showAllBooks(): void {
    // Reset archive filter to show all books
    this.showArchived.set(true);

    // [Future] Reset other dashboard filters here, e.g.:
    // this.dashboardSearchTerm.set('');
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
      
      this.settingsService.dashboardSortMode.set(newConfig.mode);
      
      return newConfig;
    });
  }

  // --- FUNGSI MANAJEMEN SELEKSI BARU ---

  /**
   * Menambah atau menghapus ID buku dari set seleksi.
   */
  toggleBookSelection(id: number): void {
    this.selectedBookIds.update(currentSet => {
      const newSet = new Set(currentSet);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  /**
   * Mengosongkan set seleksi.
   */
  clearBookSelection(): void {
    this.selectedBookIds.set(new Set());
  }

  /**
   * Mengarsipkan atau membatalkan arsip semua buku yang dipilih.
   * @param archive - `true` untuk mengarsipkan, `false` untuk membatalkan arsip.
   */
  async toggleArchiveForSelectedBooks(archive: boolean): Promise<void> {
    const idsToProcess = Array.from(this.selectedBookIds());
    if (idsToProcess.length === 0) return;

    this.isLoading.set(true);
    const originalBooks = this.books();

    // Optimistic update
    this.books.update(currentBooks =>
      currentBooks.map(book => 
        idsToProcess.includes(book.id!) ? { ...book, isArchived: archive, lastModified: new Date() } : book
      )
    );
    
    try {
      const promises = idsToProcess.map(id => 
        this.dbService.updateBookFlags(id, { isArchived: archive })
      );
      await Promise.all(promises);
      
      const actionText = archive ? 'diarsipkan' : 'batal diarsipkan';
      this.notificationService.success(`${idsToProcess.length} novel berhasil ${actionText}.`);
    } catch (error) {
      const actionText = archive ? 'mengarsipkan' : 'membatalkan arsip';
      console.error(`Gagal ${actionText} novel terpilih:`, error);
      this.notificationService.error(`Gagal ${actionText} novel.`);
      this.books.set(originalBooks); // Revert state on failure
    } finally {
      this.uiState.exitSelectMode(); // Keluar dari mode pilih
      this.isLoading.set(false);
    }
  }


  /**
   * Menghapus semua buku yang dipilih.
   */
  async deleteSelectedBooks(): Promise<void> {
    const idsToDelete = Array.from(this.selectedBookIds());
    if (idsToDelete.length === 0) return;

    this.isLoading.set(true);
    const originalBooks = this.books();

    // Optimistic update
    this.books.update(currentBooks => 
      currentBooks.filter(book => !idsToDelete.includes(book.id!))
    );

    try {
      const promises = idsToDelete.map(id => this.dbService.deleteBookAndData(id));
      await Promise.all(promises);
      
      this.notificationService.success(`${idsToDelete.length} novel berhasil dihapus.`);
    } catch (error) {
      console.error("Gagal menghapus novel terpilih:", error);
      this.notificationService.error("Gagal menghapus novel.");
      this.books.set(originalBooks); // Revert state on failure
    } finally {
      this.uiState.exitSelectMode(); // Keluar dari mode pilih
      this.isLoading.set(false);
    }
  }

  // --- Actions (Public Methods) ---

  async fetchBooks(): Promise<void> {
    this.isLoading.set(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      // 1. Fetch all books and only today's writing logs in parallel for scalability.
      const [
        basicBooks,
        todaysLogs,
      ] = await Promise.all([
        this.dbService.getAllBooks(),
        this.dbService.getWritingLogsByDate(today), // More efficient fetch
      ]);

      // 2. Group today's logs by bookId for efficient O(1) lookup.
      const todaysLogsByBookId = new Map<number, IWritingLog>();
      for (const log of todaysLogs) {
        // The index &[bookId+date] ensures one log per book per day.
        todaysLogsByBookId.set(log.bookId, log);
      }

      // 3. Combine data for each book. This loop is now much faster.
      const booksWithStats: IBookWithStats[] = basicBooks.map(book => {
        if (book.id === undefined) {
          return book as IBookWithStats;
        }

        // Calculate daily progress from pre-fetched today's logs
        const todayLog = todaysLogsByBookId.get(book.id);
        const wordsToday = todayLog ? todayLog.wordCountAdded : 0;
        const target = book.dailyWordTarget ?? 0;
        const dailyProgress = target <= 0 ? 0 : Math.min(100, Math.floor((wordsToday / target) * 100));

        return {
          ...book,
          dailyProgressPercentage: dailyProgress,
        };
      });

      this.books.set(booksWithStats);

    } catch (error) {
      console.error("Failed to fetch books:", error);
      this.notificationService.error("Gagal memuat daftar novel.");
      this.books.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addNewBook(title: string): Promise<boolean> {
    const normalizedTitle = title.trim().toLowerCase();
    const existingBook = this.books().find(book => book.title.trim().toLowerCase() === normalizedTitle);

    if (existingBook) {
      this.notificationService.error(`Novel dengan judul "${title}" sudah ada.`);
      return false;
    }

    try {
      const newBookId = await this.dbService.addBook(title);
      if (newBookId !== undefined) {
        // Add the new book to the local state after successful creation
        const newBook: IBookWithStats = {
          id: newBookId,
          title: title,
          createdAt: new Date(),
          lastModified: new Date(),
          wordCount: 0,
          dailyWordTarget: 500, // Default from db service
          isArchived: false,
          isPinned: false,
          pinOrder: undefined,
          characterCount: 0,
          chapterCount: 0,
          dailyProgressPercentage: 0
        };
        this.books.update(currentBooks => [...currentBooks, newBook]);
        this.notificationService.success(`Novel "${title}" berhasil dibuat!`);
        return true;
      } else {
        throw new Error("Book ID is not defined.");
      }
    } catch (error) {
      console.error("Failed to add book:", error);
      this.notificationService.error("Gagal membuat novel baru."); 
      return false;
    }
  }

  async deleteBook(bookId: number): Promise<void> {
    this.processingBookId.set(bookId);
    const originalBooks = this.books();
    const bookToDelete = originalBooks.find(b => b.id === bookId);
    
    if (!bookToDelete) {
        this.processingBookId.set(null);
        return;
    }

    // Optimistically update state
    this.books.update(currentBooks => currentBooks.filter(book => book.id !== bookId));
    
    try {
      await this.dbService.deleteBookAndData(bookId);
      this.notificationService.success(`Novel "${bookToDelete.title}" was deleted successfully.`); 
    } catch (error) {
      console.error("Failed to delete book:", error);
      this.notificationService.error("Failed to delete novel."); 
      this.books.set(originalBooks); // Revert on failure
    } finally {
      this.processingBookId.set(null);
    }
  }

  async updateBookTitle(bookId: number, newTitle: string): Promise<boolean> {
    const normalizedTitle = newTitle.trim().toLowerCase();
    const existingBook = this.books().find(book => 
      book.title.trim().toLowerCase() === normalizedTitle && book.id !== bookId
    );

    if (existingBook) {
      this.notificationService.error(`Novel dengan judul "${newTitle}" sudah ada.`);
      return false;
    }

    const originalBooks = this.books();

    // Optimistically update state
    this.books.update(currentBooks =>
      currentBooks.map(book => 
        book.id === bookId 
          ? { ...book, title: newTitle, lastModified: new Date() } 
          : book
      )
    );

    try {
      await this.dbService.updateBookTitle(bookId, newTitle);
      this.notificationService.success(`Judul novel diubah menjadi "${newTitle}".`); 
      return true;
    } catch (error) {
      console.error("Failed to update book title:", error);
      this.notificationService.error("Gagal memperbarui judul novel."); 
      this.books.set(originalBooks); // Revert on failure
      return false;
    }
  }

  async updateBookStats(bookId: number, data: Partial<Pick<IBook, 'dailyWordTarget' | 'wordCount'>>): Promise<void> {
   const originalBooks = this.books();

   // Optimistically update state
   this.books.update(currentBooks =>
     currentBooks.map(book => {
       if (book.id === bookId) {
         const updatedBook = { ...book, ...data, lastModified: new Date() };
         if (data.dailyWordTarget !== undefined) {
           const wordsToday = book.dailyProgressPercentage !== undefined ? ( (book.dailyProgressPercentage/100) * (book.dailyWordTarget || 0)) : 0;
           const newTarget = updatedBook.dailyWordTarget ?? 0;
           updatedBook.dailyProgressPercentage = newTarget <= 0 ? 0 : Math.min(100, Math.floor((wordsToday / newTarget) * 100));
         }
         return updatedBook;
       } else {
         return book;
       }
     })
   );
   
   try {
     await this.dbService.updateBookStats(bookId, data);
     if (data.dailyWordTarget !== undefined) {
         this.notificationService.success(`Daily target saved successfully.`);
     }
   } catch (error) {
     console.error("Failed to update book stats:", error);
     this.notificationService.error("Failed to save target/stats."); 
     this.books.set(originalBooks); // Revert on failure
   }
 }
 
  // --- NEW: Methods for Pinning and Archiving ---

  async pinBook(bookId: number, pin: boolean): Promise<void> {
    this.processingBookId.set(bookId);
    const originalBooks = this.books();

    // Optimistic update
    const pinOrder = pin ? Date.now() : undefined;
    this.books.update(currentBooks =>
      currentBooks.map(book =>
        book.id === bookId ? { ...book, isPinned: pin, pinOrder, lastModified: new Date() } : book
      )
    );

    try {
      await this.dbService.updateBookFlags(bookId, { isPinned: pin, pinOrder });
      this.notificationService.success(pin ? "Novel disematkan." : "Semat novel dilepas.");
    } catch (error) {
      console.error("Failed to update pin status:", error);
      this.notificationService.error("Gagal memperbarui status semat.");
      this.books.set(originalBooks); // Revert on failure
    } finally {
      this.processingBookId.set(null);
    }
  }

  async archiveBook(bookId: number, archive: boolean): Promise<void> {
    this.processingBookId.set(bookId);
    const originalBooks = this.books();
    const bookToArchive = originalBooks.find(b => b.id === bookId);

    // Optimistic update
    this.books.update(currentBooks =>
      currentBooks.map(book =>
        book.id === bookId ? { ...book, isArchived: archive, lastModified: new Date() } : book
      )
    );
    
    try {
      await this.dbService.updateBookFlags(bookId, { isArchived: archive });
      if (archive) {
        const title = bookToArchive?.title ?? 'Novel';
        this.notificationService.success(`Novel "${title}" diarsipkan. Tampilkan dari menu opsi untuk melihatnya kembali.`);
      } else {
        this.notificationService.success("Novel batal diarsipkan.");
      }
    } catch (error) {
      console.error("Failed to update archive status:", error);
      this.notificationService.error("Gagal memperbarui status arsip.");
      this.books.set(originalBooks); // Revert on failure
    } finally {
      this.processingBookId.set(null);
    }
  }

  async reorderPinnedBooks(event: CdkDragDrop<IBookWithStats[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    
    this.processingBookId.set(event.item.data.id);
    const originalBooks = this.books();

    // Perform optimistic update logic
    const currentPinned = [...this.pinnedBooks()];
    moveItemInArray(currentPinned, event.previousIndex, event.currentIndex);
    
    const reorderedWithNewPinOrder = currentPinned.map((book, index) => ({
      ...book,
      pinOrder: index 
    }));

    // Apply optimistic update to the main signal
    const bookMap = new Map(reorderedWithNewPinOrder.map(b => [b.id!, b]));
    this.books.update(allBooks => 
      allBooks.map(b => bookMap.get(b.id!) || b)
    );
    
    try {
      const booksToSave = reorderedWithNewPinOrder.map(b => {
          const { dailyProgressPercentage, ...dbBook } = b;
          return dbBook as IBook;
      });

      await this.dbService.updatePinnedBookOrder(booksToSave);
      this.notificationService.success("Urutan novel disematkan disimpan.");

    } catch(error) {
      console.error("Failed to reorder pinned books:", error);
      this.notificationService.error("Gagal menyimpan urutan baru.");
      this.books.set(originalBooks); // Revert on failure
    } finally {
      this.processingBookId.set(null);
    }
  }
}
