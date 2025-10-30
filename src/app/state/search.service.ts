// src/app/state/search.service.ts
import { Injectable, signal, inject, effect } from '@angular/core';
import { DatabaseService } from './database.service';
import type { ISearchResult } from '../../types/data';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private dbService = inject(DatabaseService);

  // --- State Sinyal ---
  readonly isSearching = signal(false);
  readonly showResultsModal = signal(false);
  readonly searchTerm = signal('');
  readonly searchResults = signal<ISearchResult[]>([]);
  
  // --- Debouncer (Agar tidak mencari di setiap ketukan) ---
  private searchQuery$ = new Subject<string>();

  constructor() {
    this.searchQuery$.pipe(
      debounceTime(300), // Tunggu 300ms setelah ketukan terakhir
      distinctUntilChanged() // Hanya cari jika query berubah
    ).subscribe(query => {
      this._executeSearch(query);
    });
  }

  /**
   * Dipanggil oleh UI (input) setiap kali nilai berubah.
   * Ini akan mendelegasikan ke _executeSearch setelah debounce.
   */
  search(query: string): void {
    this.searchTerm.set(query);
    if (query.trim().length === 0) {
      this.closeSearch();
      return;
    }
    
    // Tampilkan modal segera, tapi tunjukkan loading
    this.showResultsModal.set(true);
    this.isSearching.set(true);
    this.searchResults.set([]); // Kosongkan hasil sebelumnya
    
    this.searchQuery$.next(query.trim());
  }

  /**
   * Logika pencarian internal yang dipanggil oleh debouncer.
   */
  private async _executeSearch(query: string): Promise<void> {
    if (query.length < 2) { // Jangan cari jika terlalu pendek
      this.isSearching.set(false);
      this.searchResults.set([]);
      return;
    }
    
    this.isSearching.set(true);
    try {
      const results = await this.dbService.searchAllEntities(query);
      this.searchResults.set(results);
    } catch (error) {
      console.error("Gagal melakukan pencarian:", error);
      this.searchResults.set([]);
    } finally {
      this.isSearching.set(false);
    }
  }

  /**
   * Menutup dan mereset state pencarian.
   */
  closeSearch(): void {
    this.showResultsModal.set(false);
    this.isSearching.set(false);
    this.searchResults.set([]);
    this.searchTerm.set('');
  }
}
