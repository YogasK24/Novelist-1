// src/app/state/current-book-state.service.ts

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest, switchMap, shareReplay, distinctUntilChanged, tap, finalize } from 'rxjs';
import { DatabaseService } from './database.service';
import type { IBook, ICharacter, ILocation, IPlotEvent, IChapter } from '../../types/data';

// Interface state gabungan (opsional, bisa dihapus jika tidak dipakai langsung)
interface CurrentBookFullState {
  book: IBook | null;
  characters: ICharacter[];
  locations: ILocation[];
  plotEvents: IPlotEvent[];
  chapters: IChapter[];
}

@Injectable({
  providedIn: 'root'
})
export class CurrentBookStateService {
  private readonly dbService = inject(DatabaseService);

  // --- State Internal ---
  private readonly _currentBookId$ = new BehaviorSubject<number | null>(null);
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  // Tambahkan BehaviorSubject internal untuk data anak
  private readonly _characters$ = new BehaviorSubject<ICharacter[]>([]);
  private readonly _locations$ = new BehaviorSubject<ILocation[]>([]);
  private readonly _plotEvents$ = new BehaviorSubject<IPlotEvent[]>([]);
  private readonly _chapters$ = new BehaviorSubject<IChapter[]>([]);

  // --- State Publik (Observables) ---
  readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();
  readonly currentBookId$: Observable<number | null> = this._currentBookId$.asObservable();

  // Observable buku utama (langsung dari DB saat ID berubah)
  readonly currentBook$: Observable<IBook | null> = this._currentBookId$.pipe(
    distinctUntilChanged(),
    tap(() => this._isLoading$.next(true)), // Mulai loading saat ID berubah
    switchMap(id => id === null ? of(null) : this.dbService.getBookById(id)),
    tap(() => this._isLoading$.next(false)), // Selesai loading buku utama
    shareReplay(1)
  );

  // Observable data anak (dari BehaviorSubject internal)
  readonly characters$: Observable<ICharacter[]> = this._characters$.asObservable();
  readonly locations$: Observable<ILocation[]> = this._locations$.asObservable();
  readonly plotEvents$: Observable<IPlotEvent[]> = this._plotEvents$.asObservable();
  readonly chapters$: Observable<IChapter[]> = this._chapters$.asObservable();

  // Gabungan state (jika perlu)
  readonly currentBookFullState$: Observable<CurrentBookFullState> = combineLatest({
      book: this.currentBook$,
      characters: this.characters$,
      locations: this.locations$,
      plotEvents: this.plotEvents$,
      chapters: this.chapters$
  }).pipe(shareReplay(1));


  constructor() {
     // Dengarkan perubahan ID buku untuk memuat semua data anak
     this._currentBookId$.pipe(
        distinctUntilChanged(),
        tap(() => { // Reset data anak saat ID null atau berubah
            this._isLoading$.next(true); // Set loading di awal
            this._characters$.next([]);
            this._locations$.next([]);
            this._plotEvents$.next([]);
            this._chapters$.next([]);
        }),
        // Hanya lanjut jika ID tidak null
        switchMap(id => id === null ? of(null) : this.loadAllChildData(id)),
        finalize(() => this._isLoading$.next(false)) // Pastikan loading false di akhir
     ).subscribe(); // Subscribe agar pipeline ini aktif
  }

  // --- Metode Internal untuk Memuat Data Anak ---
  private async loadAllChildData(bookId: number): Promise<void> {
    try {
        const [characters, locations, plotEvents, chapters] = await Promise.all([
            this.dbService.getCharactersByBookId(bookId),
            this.dbService.getLocationsByBookId(bookId),
            this.dbService.getPlotEventsByBookId(bookId),
            this.dbService.getChaptersByBookId(bookId),
        ]);
        // Update BehaviorSubjects internal
        this._characters$.next(characters || []);
        this._locations$.next(locations || []);
        this._plotEvents$.next(plotEvents || []);
        this._chapters$.next(chapters || []);
    } catch (error) {
        console.error("Gagal load data anak:", error);
        // Biarkan state anak kosong
    } finally {
        this._isLoading$.next(false); // Set loading false setelah semua selesai
    }
  }


  // --- Actions Publik ---

  /** Memulai proses pemuatan data buku berdasarkan ID */
  loadBookData(bookId: number): void {
     // Hanya perlu emit ID baru, pipeline di constructor akan handle loading
     if (this._currentBookId$.getValue() !== bookId) {
        this._currentBookId$.next(bookId);
     }
  }

  /** Membersihkan data buku saat ini */
  clearBookData(): void {
    this._currentBookId$.next(null); // Ini akan otomatis mereset state via pipeline
  }

  // --- CRUD Actions (Sekarang update state internal secara eksplisit) ---

  // Character Actions
  async addCharacter(name: string, description: string): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    const newId = await this.dbService.addCharacter({ bookId, name, description });
    if (newId !== undefined) {
      // Ambil data terbaru dan update state
      const updatedList = await this.dbService.getCharactersByBookId(bookId);
      this._characters$.next(updatedList);
    }
  }
  async updateCharacter(id: number, data: { name: string, description: string }): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    await this.dbService.updateCharacter(id, data);
    const updatedList = await this.dbService.getCharactersByBookId(bookId);
    this._characters$.next(updatedList);
  }
  async deleteCharacter(id: number): Promise<void> {
     const bookId = this._currentBookId$.getValue();
     if (!bookId) return;
    await this.dbService.deleteCharacter(id);
    const updatedList = await this.dbService.getCharactersByBookId(bookId);
    this._characters$.next(updatedList);
  }

  // Location Actions
  async addLocation(name: string, description: string): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    const newId = await this.dbService.addLocation({ bookId, name, description });
    if (newId !== undefined) {
      const updatedList = await this.dbService.getLocationsByBookId(bookId);
      this._locations$.next(updatedList);
    }
  }
  async updateLocation(id: number, data: { name: string, description: string }): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    await this.dbService.updateLocation(id, data);
    const updatedList = await this.dbService.getLocationsByBookId(bookId);
    this._locations$.next(updatedList);
  }
  async deleteLocation(id: number): Promise<void> {
     const bookId = this._currentBookId$.getValue();
     if (!bookId) return;
    await this.dbService.deleteLocation(id);
    const updatedList = await this.dbService.getLocationsByBookId(bookId);
    this._locations$.next(updatedList);
  }

  // Plot Event Actions
  async addPlotEvent(title: string, summary: string): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    // Dapatkan order terbaru langsung dari DB
    const currentEvents = await this.dbService.getPlotEventsByBookId(bookId);
    const maxOrder = currentEvents.reduce((max, event) => Math.max(max, event.order), 0);
    const newOrder = maxOrder + 1;
    const newId = await this.dbService.addPlotEvent({ bookId, title, summary, order: newOrder });
    if (newId !== undefined) {
        const updatedList = await this.dbService.getPlotEventsByBookId(bookId); // Sudah terurut
        this._plotEvents$.next(updatedList);
    }
  }
  async updatePlotEvent(id: number, data: { title: string, summary: string }): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    await this.dbService.updatePlotEvent(id, data);
    const updatedList = await this.dbService.getPlotEventsByBookId(bookId);
    this._plotEvents$.next(updatedList);
  }
  async deletePlotEvent(id: number): Promise<void> {
     const bookId = this._currentBookId$.getValue();
     if (!bookId) return;
    await this.dbService.deletePlotEvent(id);
    const updatedList = await this.dbService.getPlotEventsByBookId(bookId);
    this._plotEvents$.next(updatedList);
  }

  // Chapter Actions
  async addChapter(title: string): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    const currentChapters = await this.dbService.getChaptersByBookId(bookId);
    const maxOrder = currentChapters.reduce((max, chap) => Math.max(max, chap.order), 0);
    const newOrder = maxOrder + 1;
    const newId = await this.dbService.addChapter({ bookId, title, content: "", order: newOrder });
    if (newId !== undefined) {
       const updatedList = await this.dbService.getChaptersByBookId(bookId); // Sudah terurut
       this._chapters$.next(updatedList);
    }
  }
  async updateChapterTitle(id: number, title: string): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    await this.dbService.updateChapter(id, { title });
    const updatedList = await this.dbService.getChaptersByBookId(bookId);
    this._chapters$.next(updatedList);
  }
  async deleteChapter(id: number): Promise<void> {
     const bookId = this._currentBookId$.getValue();
     if (!bookId) return;
    await this.dbService.deleteChapter(id);
    const updatedList = await this.dbService.getChaptersByBookId(bookId);
    this._chapters$.next(updatedList);
  }

}
