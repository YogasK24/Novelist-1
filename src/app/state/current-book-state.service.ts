// src/app/state/current-book-state.service.ts
// REFAKTORED VERSION

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest, EMPTY } from 'rxjs';
import { switchMap, shareReplay, distinctUntilChanged, tap, finalize, catchError } from 'rxjs/operators';
import { DatabaseService } from './database.service'; // Pastikan path benar
import type { IBook, ICharacter, ILocation, IPlotEvent, IChapter } from '../../types/data';

// Interface state gabungan (opsional)
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
  private readonly _characters$ = new BehaviorSubject<ICharacter[]>([]);
  private readonly _locations$ = new BehaviorSubject<ILocation[]>([]);
  private readonly _plotEvents$ = new BehaviorSubject<IPlotEvent[]>([]);
  private readonly _chapters$ = new BehaviorSubject<IChapter[]>([]);

  // --- State Publik (Observables) ---
  readonly isLoading$: Observable<boolean> = this._isLoading$.asObservable();
  readonly currentBookId$: Observable<number | null> = this._currentBookId$.asObservable();

  // Observable buku utama
  readonly currentBook$: Observable<IBook | null> = this._currentBookId$.pipe(
    distinctUntilChanged(),
    // Tidak set loading di sini, biarkan pipeline utama yang handle
    switchMap(id => {
        if (id === null) return of(null);
        // Ambil buku dari DB, tangani error jika tidak ditemukan
        return this.dbService.getBookById(id).then(book => book ?? null)
                   .catch(err => {
                       console.error(`Error fetching book ${id}:`, err);
                       return null; // Kembalikan null jika error
                   });
    }),
    // Gunakan shareReplay dengan refCount
    shareReplay({ bufferSize: 1, refCount: true }) 
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
  // Gunakan shareReplay dengan refCount
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));


  constructor() {
     // Pipeline utama untuk memuat data anak saat ID berubah
     this._currentBookId$.pipe(
        distinctUntilChanged(),
        tap(() => { // Reset state anak dan set loading=true saat ID berubah
            this._isLoading$.next(true); 
            this._characters$.next([]);
            this._locations$.next([]);
            this._plotEvents$.next([]);
            this._chapters$.next([]);
        }),
        switchMap(id => {
            if (id === null) {
                // Jika ID null, langsung set loading=false dan hentikan pipeline
                this._isLoading$.next(false);
                return EMPTY; // EMPTY observable agar tidak lanjut
            }
            // Jika ID ada, panggil loadAllChildData
            // Gunakan catchError untuk menangani error di loadAllChildData
            // dan finalize untuk memastikan loading=false
            return of(id).pipe(
                switchMap(bookId => this.loadAllChildData(bookId)),
                catchError(err => {
                    console.error("Error dalam pipeline loadAllChildData:", err);
                    return EMPTY; // Hentikan pipeline jika ada error parah saat load
                }),
                // Finalize akan selalu jalan, baik sukses maupun error
                finalize(() => this._isLoading$.next(false)) 
            );
        })
     ).subscribe(); // Subscribe agar pipeline ini aktif
  }

  // --- Metode Internal untuk Memuat Data Anak ---
  private async loadAllChildData(bookId: number): Promise<void> {
    // try...catch sudah ada di dalam dbService, di sini fokus update state
    // Promise.all akan reject jika salah satu gagal, jadi kita tangani di pipeline utama
    const [characters, locations, plotEvents, chapters] = await Promise.all([
        this.dbService.getCharactersByBookId(bookId),
        this.dbService.getLocationsByBookId(bookId),
        this.dbService.getPlotEventsByBookId(bookId),
        this.dbService.getChaptersByBookId(bookId),
    ]);
    // Update BehaviorSubjects internal
    this._characters$.next(characters ?? []); // Gunakan ?? [] untuk fallback jika undefined
    this._locations$.next(locations ?? []);
    this._plotEvents$.next(plotEvents ?? []);
    this._chapters$.next(chapters ?? []);
    // Loading state dihandle oleh finalize di pipeline utama
  }


  // --- Actions Publik ---

  /** Memulai proses pemuatan data buku berdasarkan ID */
  loadBookData(bookId: number): void {
     if (this._currentBookId$.getValue() !== bookId) {
        this._currentBookId$.next(bookId);
     }
  }

  /** Membersihkan data buku saat ini */
  clearBookData(): void {
    this._currentBookId$.next(null); 
  }

  // --- CRUD Actions (Lebih aman dan efisien) ---

  // Fungsi helper untuk refresh data anak tertentu
  private async refreshChildData<T>(
    fetchFn: (bookId: number) => Promise<T[]>, 
    subject: BehaviorSubject<T[]>
  ): Promise<void> {
      const bookId = this._currentBookId$.getValue();
      if (!bookId) return; // Pemeriksaan null eksplisit
      try {
          // Set loading=true sebelum fetch ulang (opsional, tergantung UX)
          // this._isLoading$.next(true); 
          const updatedList = await fetchFn(bookId);
          subject.next(updatedList ?? []); // Update state dengan data baru
      } catch (error) {
          console.error("Gagal refresh data anak:", error);
          // Mungkin reset subject ke [] atau biarkan data lama?
          // subject.next([]); 
      } finally {
          // this._isLoading$.next(false); // Set false jika loading di set true di atas
      }
  }

  // Character Actions
  async addCharacter(name: string, description: string): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return; // Pemeriksaan null eksplisit
    try {
      await this.dbService.addCharacter({ bookId, name, description });
      await this.refreshChildData(this.dbService.getCharactersByBookId.bind(this.dbService), this._characters$);
    } catch(error) { console.error("addCharacter error:", error); }
  }
  async updateCharacter(id: number, data: { name: string, description: string }): Promise<void> {
    if (!this._currentBookId$.getValue()) return; // Pemeriksaan null eksplisit
    try {
      await this.dbService.updateCharacter(id, data);
      await this.refreshChildData(this.dbService.getCharactersByBookId.bind(this.dbService), this._characters$);
    } catch(error) { console.error("updateCharacter error:", error); }
  }
  async deleteCharacter(id: number): Promise<void> {
     if (!this._currentBookId$.getValue()) return; // Pemeriksaan null eksplisit
     try {
       await this.dbService.deleteCharacter(id);
       await this.refreshChildData(this.dbService.getCharactersByBookId.bind(this.dbService), this._characters$);
     } catch(error) { console.error("deleteCharacter error:", error); }
  }

  // Location Actions
  async addLocation(name: string, description: string): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    try {
      await this.dbService.addLocation({ bookId, name, description });
      await this.refreshChildData(this.dbService.getLocationsByBookId.bind(this.dbService), this._locations$);
    } catch(error) { console.error("addLocation error:", error); }
  }
  async updateLocation(id: number, data: { name: string, description: string }): Promise<void> {
    if (!this._currentBookId$.getValue()) return;
    try {
      await this.dbService.updateLocation(id, data);
      await this.refreshChildData(this.dbService.getLocationsByBookId.bind(this.dbService), this._locations$);
    } catch(error) { console.error("updateLocation error:", error); }
  }
  async deleteLocation(id: number): Promise<void> {
     if (!this._currentBookId$.getValue()) return;
     try {
       await this.dbService.deleteLocation(id);
       await this.refreshChildData(this.dbService.getLocationsByBookId.bind(this.dbService), this._locations$);
     } catch(error) { console.error("deleteLocation error:", error); }
  }

  // Plot Event Actions
  async addPlotEvent(title: string, summary: string): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    try {
      // Ambil order terbaru saat ini juga, lebih aman
      const currentEvents = await this.dbService.getPlotEventsByBookId(bookId);
      const maxOrder = currentEvents.reduce((max, event) => Math.max(max, event.order), 0);
      const newOrder = maxOrder + 1;
      await this.dbService.addPlotEvent({ bookId, title, summary, order: newOrder });
      await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this._plotEvents$);
    } catch(error) { console.error("addPlotEvent error:", error); }
  }
  async updatePlotEvent(id: number, data: { title: string, summary: string }): Promise<void> {
    if (!this._currentBookId$.getValue()) return;
    try {
      await this.dbService.updatePlotEvent(id, data);
      await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this._plotEvents$);
    } catch(error) { console.error("updatePlotEvent error:", error); }
  }
  async deletePlotEvent(id: number): Promise<void> {
     if (!this._currentBookId$.getValue()) return;
     try {
       await this.dbService.deletePlotEvent(id);
       await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this._plotEvents$);
     } catch(error) { console.error("deletePlotEvent error:", error); }
  }

  // Chapter Actions
  async addChapter(title: string): Promise<void> {
    const bookId = this._currentBookId$.getValue();
    if (!bookId) return;
    try {
      const currentChapters = await this.dbService.getChaptersByBookId(bookId);
      const maxOrder = currentChapters.reduce((max, chap) => Math.max(max, chap.order), 0);
      const newOrder = maxOrder + 1;
      await this.dbService.addChapter({ bookId, title, content: "", order: newOrder });
      await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this._chapters$);
    } catch(error) { console.error("addChapter error:", error); }
  }
  async updateChapterTitle(id: number, title: string): Promise<void> {
    if (!this._currentBookId$.getValue()) return;
    try {
      await this.dbService.updateChapter(id, { title });
      await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this._chapters$);
    } catch(error) { console.error("updateChapterTitle error:", error); }
  }
  async deleteChapter(id: number): Promise<void> {
     if (!this._currentBookId$.getValue()) return;
     try {
       await this.dbService.deleteChapter(id);
       await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this._chapters$);
     } catch(error) { console.error("deleteChapter error:", error); }
  }

}