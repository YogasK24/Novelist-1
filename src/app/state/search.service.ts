// src/app/state/search.service.ts
import { Injectable, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';
import type { ISearchResult } from '../../types/data';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UiStateService } from './ui-state.service';

const SEARCH_HISTORY_KEY = 'novelist_searchHistory';
const MAX_HISTORY_ITEMS = 5;

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private dbService = inject(DatabaseService);
  private uiState = inject(UiStateService);
  private router = inject(Router);

  // --- State Sinyal ---
  readonly isSearching = signal(false);
  
  // SSoT (Single Source of Truth) untuk status UI pencarian sekarang berasal dari UiStateService
  readonly isSearchActive = computed(() => this.uiState.headerState() === 'searchActive');
  
  readonly searchTerm = signal('');
  readonly searchResults = signal<ISearchResult[]>([]);
  readonly hasBeenInteractedWith = signal(false);
  readonly activeIndex = signal<number | null>(null);

  // --- NEW: Search History State ---
  readonly recentSearches = signal<ISearchResult[]>([]);

  // --- Debouncer (Agar tidak mencari di setiap ketukan) ---
  private searchQuery$ = new Subject<string>();

  constructor() {
    this.searchQuery$.pipe(
      debounceTime(300), // Tunggu 300ms setelah ketukan terakhir
      distinctUntilChanged() // Hanya cari jika query berubah
    ).subscribe(query => {
      this._executeSearch(query);
    });

    this._loadHistory();
  }

  /**
   * Dipanggil oleh UI (input) setiap kali nilai berubah.
   * Ini juga bertanggung jawab untuk mengaktifkan UI.
   */
  search(query: string): void {
    this.searchTerm.set(query);
    this.hasBeenInteractedWith.set(true);
    this.uiState.activateHeaderSearch(); // Pastikan UI aktif

    if (query.trim().length === 0) {
      // Jika query kosong, bersihkan hasil tapi UI tetap terbuka
      this.isSearching.set(false);
      this.searchResults.set([]);
      this.activeIndex.set(null); 
      this.searchQuery$.next(''); // Hentikan debouncer yang mungkin berjalan
      return;
    }
    
    // Tampilkan loading dan kosongkan hasil sebelumnya
    this.isSearching.set(true);
    this.searchResults.set([]);
    
    this.searchQuery$.next(query.trim());
  }

  /**
   * Logika pencarian internal yang dipanggil oleh debouncer.
   */
  private async _executeSearch(query: string): Promise<void> {
    if (query.length === 0) {
      this.isSearching.set(false);
      this.searchResults.set([]);
      this.activeIndex.set(null); 
      return;
    }
    
    this.isSearching.set(true);
    try {
      const results = await this.dbService.searchAllEntities(query);
      this.searchResults.set(results);
      this.activeIndex.set(results.length > 0 ? 0 : null); 
    } catch (error) {
      console.error("Gagal melakukan pencarian:", error);
      this.searchResults.set([]);
    } finally {
      this.isSearching.set(false);
    }
  }

  /**
   * Menutup dan mereset semua state pencarian.
   */
  closeSearch(): void {
    this.uiState.deactivateHeaderSearch();
    // Reset state internal pencarian
    this.isSearching.set(false);
    this.searchResults.set([]);
    this.searchTerm.set('');
    this.hasBeenInteractedWith.set(false);
    this.activeIndex.set(null); 
  }

  /**
   * Dipanggil oleh tombol ikon search di header untuk membuka/menutup UI.
   */
  toggleSearch(): void {
    this.uiState.toggleHeaderSearch();
  }

  // --- NEW: Keyboard Navigation Methods ---
  
  /**
   * Pindahkan sorotan ke item sebelumnya dalam daftar hasil.
   */
  navigateUp(): void {
    if (this.searchResults().length === 0) return;
    this.activeIndex.update(current => {
      if (current === null || current === 0) {
        return this.searchResults().length - 1;
      }
      return current - 1;
    });
  }

  /**
   * Pindahkan sorotan ke item berikutnya dalam daftar hasil.
   */
  navigateDown(): void {
    if (this.searchResults().length === 0) return;
    this.activeIndex.update(current => {
      if (current === null || current >= this.searchResults().length - 1) {
        return 0;
      }
      return current + 1;
    });
  }

  /**
   * Menavigasi ke hasil yang sedang aktif disorot.
   */
  navigateToActiveResult(): void {
    const index = this.activeIndex();
    if (index === null) return;
    
    const result = this.searchResults()[index];
    if (!result) return;
    
    this.addSearchToHistory(result); // <-- ADD TO HISTORY
    const path = this.getLinkPath(result);
    this.router.navigate(path);
    this.closeSearch();
  }
  
  /**
   * Tentukan path navigasi berdasarkan tipe hasil pencarian.
   */
  getLinkPath(result: ISearchResult): string[] {
    switch (result.type) {
      case 'Book':
        return ['/book', result.bookId.toString()];
      case 'Chapter':
        return ['/book', result.bookId.toString(), 'write', result.entityId.toString()];
      // Semua item world-building lainnya mengarah ke halaman buku (tempat tab berada)
      case 'Character':
      case 'Location':
      case 'PlotEvent':
      case 'Theme':
      case 'Prop':
        return ['/book', result.bookId.toString()];
      default:
        return ['/'];
    }
  }

  // --- NEW: Search History Methods ---
  
  private _loadHistory(): void {
    try {
      const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (storedHistory) {
        this.recentSearches.set(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Gagal memuat riwayat pencarian:", e);
      this.recentSearches.set([]);
    }
  }
  
  private _saveHistory(): void {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(this.recentSearches()));
    } catch (e) {
      console.error("Gagal menyimpan riwayat pencarian:", e);
    }
  }
  
  addSearchToHistory(result: ISearchResult): void {
    this.recentSearches.update(history => {
      // Hapus duplikat jika ada
      const filtered = history.filter(item => !(item.type === result.type && item.entityId === result.entityId));
      // Tambahkan item baru ke depan dan batasi jumlahnya
      const newHistory = [result, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      return newHistory;
    });
    this._saveHistory();
  }

  clearSearchHistory(): void {
    this.recentSearches.set([]);
    this._saveHistory();
  }
}