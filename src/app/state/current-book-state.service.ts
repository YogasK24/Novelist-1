// src/app/state/current-book-state.service.ts
// REFACTORED TO SIGNALS

import { Injectable, inject, signal, effect, WritableSignal, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import type { IBook, ICharacter, ILocation, IPlotEvent, IChapter, ITheme, IProp } from '../../types/data';

@Injectable({
  providedIn: 'root'
})
export class CurrentBookStateService {
  private readonly dbService = inject(DatabaseService);

  // --- STATE PRIMER (Writable Signals) ---
  readonly currentBookId = signal<number | null>(null);
  readonly isLoading = signal<boolean>(false); // Digunakan untuk pemuatan buku utama
  
  readonly currentBook = signal<IBook | null>(null);
  readonly characters = signal<ICharacter[]>([]);
  readonly locations = signal<ILocation[]>([]);
  readonly plotEvents = signal<IPlotEvent[]>([]);
  readonly chapters = signal<IChapter[]>([]);
  readonly themes = signal<ITheme[]>([]);
  readonly props = signal<IProp[]>([]);

  // --- KOMPUTASI RELASI (Signal Computed) ---
  // 1. Peta ID Karakter -> Objek Karakter
  readonly characterMap = computed<Map<number, ICharacter>>(() => {
    const map = new Map<number, ICharacter>();
    for (const char of this.characters()) {
      if (char.id != null) {
        map.set(char.id, char);
      }
    }
    return map;
  });

  // 2. Peta ID Lokasi -> Objek Lokasi
  readonly locationMap = computed<Map<number, ILocation>>(() => {
    const map = new Map<number, ILocation>();
    for (const loc of this.locations()) {
      if (loc.id != null) {
        map.set(loc.id, loc);
      }
    }
    return map;
  });
  
  // 3. Peta ID Lokasi -> Nama Lokasi (Jika lebih sering butuh nama)
  readonly locationNameMap = computed<Map<number, string>>(() => {
    const map = new Map<number, string>();
    for (const loc of this.locations()) {
      if (loc.id != null) {
        map.set(loc.id, loc.name);
      }
    }
    return map;
  });

  constructor() {
    effect(() => {
      const bookId = this.currentBookId();
      if (bookId !== null) {
        this.loadBookCoreData(bookId); // Panggil pemuatan inti
      } else {
        this.resetState();
      }
    });
  }
  
  private resetState(): void {
    this.isLoading.set(false);
    this.currentBook.set(null);
    this.characters.set([]);
    this.locations.set([]);
    this.plotEvents.set([]);
    this.chapters.set([]);
    this.themes.set([]);
    this.props.set([]);
  }

  /** Metode Private: Memuat data buku utama saja */
  private async loadBookCoreData(bookId: number): Promise<void> {
    this.isLoading.set(true);
    try {
        const bookData = await this.dbService.getBookById(bookId);
        this.currentBook.set(bookData ?? null); 

        if (!bookData) {
            console.warn(`Buku dengan ID ${bookId} tidak ditemukan.`);
        }
    } catch (error) {
        console.error("Gagal memuat data buku inti:", error);
        this.currentBook.set(null);
    } finally {
        this.isLoading.set(false);
    }
  }

  
  private async refreshChildData<T>(
    fetchFn: (bookId: number) => Promise<T[]>, 
    targetSignal: WritableSignal<T[]>
  ): Promise<void> {
      const bookId = this.currentBookId();
      if (!bookId) return;
      try {
          const updatedList = await fetchFn(bookId);
          targetSignal.set(updatedList ?? []);
      } catch (error) {
          console.error("Gagal refresh data anak:", error);
      }
  }

  // --- PUBLIC ACTIONS ---

  loadBookData(bookId: number): void {
     if (this.currentBookId() !== bookId) {
        this.currentBookId.set(bookId);
     }
  }

  clearBookData(): void {
    this.currentBookId.set(null);
  }

  // --- Actions Publik untuk Lazy Loading Data Anak ---
  async loadCharacters(bookId: number): Promise<void> {
    this.isLoading.set(true);
    try {
        const characters = await this.dbService.getCharactersByBookId(bookId);
        this.characters.set(characters ?? []);
    } catch (e) {
        console.error("Gagal load characters:", e);
        this.characters.set([]);
    } finally {
        this.isLoading.set(false);
    }
  }

  async loadLocations(bookId: number): Promise<void> {
    this.isLoading.set(true);
    try {
        const locations = await this.dbService.getLocationsByBookId(bookId);
        this.locations.set(locations ?? []);
    } catch (e) {
        console.error("Gagal load locations:", e);
        this.locations.set([]);
    } finally {
        this.isLoading.set(false);
    }
  }

  async loadPlotEvents(bookId: number): Promise<void> {
    this.isLoading.set(true);
    try {
        const plotEvents = await this.dbService.getPlotEventsByBookId(bookId);
        this.plotEvents.set(plotEvents ?? []);
    } catch (e) {
        console.error("Gagal load plot events:", e);
        this.plotEvents.set([]);
    } finally {
        this.isLoading.set(false);
    }
  }

  async loadChapters(bookId: number): Promise<void> {
    this.isLoading.set(true);
    try {
        const chapters = await this.dbService.getChaptersByBookId(bookId);
        this.chapters.set(chapters ?? []);
    } catch (e) {
        console.error("Gagal load chapters:", e);
        this.chapters.set([]);
    } finally {
        this.isLoading.set(false);
    }
  }

  async loadThemes(bookId: number): Promise<void> {
    this.isLoading.set(true);
    try {
        const themes = await this.dbService.getThemesByBookId(bookId);
        this.themes.set(themes ?? []);
    } catch (e) {
        console.error("Gagal load themes:", e);
        this.themes.set([]);
    } finally {
        this.isLoading.set(false);
    }
  }

  async loadProps(bookId: number): Promise<void> {
    this.isLoading.set(true);
    try {
        const props = await this.dbService.getPropsByBookId(bookId);
        this.props.set(props ?? []);
    } catch (e) {
        console.error("Gagal load props:", e);
        this.props.set([]);
    } finally {
        this.isLoading.set(false);
    }
  }

  // --- CRUD Actions ---

  // Character Actions
  async addCharacter(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      await this.dbService.addCharacter({ bookId, name, description });
      await this.refreshChildData(this.dbService.getCharactersByBookId.bind(this.dbService), this.characters);
    } catch(error) { console.error("addCharacter error:", error); }
  }
  async updateCharacter(id: number, data: { name: string, description: string }): Promise<void> {
    if (!this.currentBookId()) return;
    try {
      await this.dbService.updateCharacter(id, data);
      await this.refreshChildData(this.dbService.getCharactersByBookId.bind(this.dbService), this.characters);
    } catch(error) { console.error("updateCharacter error:", error); }
  }
  async deleteCharacter(id: number): Promise<void> {
     if (!this.currentBookId()) return;
     try {
       await this.dbService.deleteCharacter(id);
       await this.refreshChildData(this.dbService.getCharactersByBookId.bind(this.dbService), this.characters);
     } catch(error) { console.error("deleteCharacter error:", error); }
  }

  // Location Actions
  async addLocation(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      await this.dbService.addLocation({ bookId, name, description });
      await this.refreshChildData(this.dbService.getLocationsByBookId.bind(this.dbService), this.locations);
    } catch(error) { console.error("addLocation error:", error); }
  }
  async updateLocation(id: number, data: { name: string, description: string }): Promise<void> {
    if (!this.currentBookId()) return;
    try {
      await this.dbService.updateLocation(id, data);
      await this.refreshChildData(this.dbService.getLocationsByBookId.bind(this.dbService), this.locations);
    } catch(error) { console.error("updateLocation error:", error); }
  }
  async deleteLocation(id: number): Promise<void> {
     if (!this.currentBookId()) return;
     try {
       await this.dbService.deleteLocation(id);
       await this.refreshChildData(this.dbService.getLocationsByBookId.bind(this.dbService), this.locations);
     } catch(error) { console.error("deleteLocation error:", error); }
  }

  // Plot Event Actions
  async addPlotEvent(title: string, summary: string, locationId: number | null, characterIds: number[]): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      const currentEvents = await this.dbService.getPlotEventsByBookId(bookId);
      const maxOrder = currentEvents.reduce((max, event) => Math.max(max, event.order), 0);
      const newOrder = maxOrder + 1;
      await this.dbService.addPlotEvent({ bookId, title, summary, order: newOrder, locationId, characterIds });
      await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this.plotEvents);
    } catch(error) { console.error("addPlotEvent error:", error); }
  }
  async updatePlotEvent(id: number, data: { title: string, summary: string, locationId: number | null, characterIds: number[] }): Promise<void> {
    if (!this.currentBookId()) return;
    try {
      await this.dbService.updatePlotEvent(id, data);
      await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this.plotEvents);
    } catch(error) { console.error("updatePlotEvent error:", error); }
  }
  async deletePlotEvent(id: number): Promise<void> {
     if (!this.currentBookId()) return;
     try {
       await this.dbService.deletePlotEvent(id);
       await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this.plotEvents);
     } catch(error) { console.error("deletePlotEvent error:", error); }
  }

  // <-- ACTIONS REORDER PLOT EVENT -->
  async reorderPlotEvents(reorderedEvents: IPlotEvent[]): Promise<void> {
    if (!this.currentBookId()) return;

    // 1. Simpan ke database
    try {
        await this.dbService.updatePlotEventOrder(reorderedEvents);
        
        // 2. Update signal secara optimis (atau refresh)
        // Kita update secara optimis karena kita sudah tahu urutannya
        this.plotEvents.set(reorderedEvents); 
    } catch(error) { 
        console.error("reorderPlotEvents error:", error); 
        // Jika gagal, refresh dari DB
        await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this.plotEvents);
    }
  }

  // Chapter Actions
  async addChapter(title: string, characterIds: number[]): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      const currentChapters = await this.dbService.getChaptersByBookId(bookId);
      const maxOrder = currentChapters.reduce((max, chap) => Math.max(max, chap.order), 0);
      const newOrder = maxOrder + 1;
      await this.dbService.addChapter({ bookId, title, content: "", order: newOrder, characterIds });
      await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters);
    } catch(error) { console.error("addChapter error:", error); }
  }
  async updateChapterTitle(id: number, title: string, characterIds: number[]): Promise<void> {
    if (!this.currentBookId()) return;
    try {
      await this.dbService.updateChapter(id, { title, characterIds });
      await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters);
    } catch(error) { console.error("updateChapterTitle error:", error); }
  }
  async updateChapterContent(id: number, content: string): Promise<void> {
    if (!this.currentBookId()) return;
    try {
      await this.dbService.updateChapter(id, { content });
      this.chapters.update(currentChapters =>
        currentChapters.map(chap => 
          chap.id === id ? { ...chap, content: content } : chap
        )
      );
    } catch(error) { 
      console.error("updateChapterContent error:", error);
      await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters);
    }
  }
  async deleteChapter(id: number): Promise<void> {
     if (!this.currentBookId()) return;
     try {
       await this.dbService.deleteChapter(id);
       await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters);
     } catch(error) { console.error("deleteChapter error:", error); }
  }
  
  // <-- ACTIONS REORDER CHAPTERS -->
  async reorderChapters(reorderedChapters: IChapter[]): Promise<void> {
    if (!this.currentBookId()) return;

    // 1. Simpan ke database
    try {
        await this.dbService.updateChapterOrder(reorderedChapters);
        
        // 2. Update signal secara optimis
        this.chapters.set(reorderedChapters);
    } catch(error) { 
        console.error("reorderChapters error:", error); 
        await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters);
    }
  }
  
  // --- Themes ---
  async addTheme(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return; 
    try {
      await this.dbService.addTheme({ bookId, name, description });
      await this.refreshChildData(this.dbService.getThemesByBookId.bind(this.dbService), this.themes);
    } catch(error) { console.error("addTheme error:", error); }
  }
  async updateTheme(id: number, data: { name: string, description: string }): Promise<void> {
    if (!this.currentBookId()) return; 
    try {
      await this.dbService.updateTheme(id, data);
      await this.refreshChildData(this.dbService.getThemesByBookId.bind(this.dbService), this.themes);
    } catch(error) { console.error("updateTheme error:", error); }
  }
  async deleteTheme(id: number): Promise<void> {
     if (!this.currentBookId()) return; 
     try {
       await this.dbService.deleteTheme(id);
       await this.refreshChildData(this.dbService.getThemesByBookId.bind(this.dbService), this.themes);
     } catch(error) { console.error("deleteTheme error:", error); }
  }

  // --- Props ---
   async addProp(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return; 
    try {
      await this.dbService.addProp({ bookId, name, description });
      await this.refreshChildData(this.dbService.getPropsByBookId.bind(this.dbService), this.props);
    } catch(error) { console.error("addProp error:", error); }
  }
  async updateProp(id: number, data: { name: string, description: string }): Promise<void> {
    if (!this.currentBookId()) return; 
    try {
      await this.dbService.updateProp(id, data);
      await this.refreshChildData(this.dbService.getPropsByBookId.bind(this.dbService), this.props);
    } catch(error) { console.error("updateProp error:", error); }
  }
  async deleteProp(id: number): Promise<void> {
     if (!this.currentBookId()) return; 
     try {
       await this.dbService.deleteProp(id);
       await this.refreshChildData(this.dbService.getPropsByBookId.bind(this.dbService), this.props);
     } catch(error) { console.error("deleteProp error:", error); }
  }
}