// src/app/state/current-book-state.service.ts
// REFACTORED TO SIGNALS

import { Injectable, inject, signal, effect, WritableSignal, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import { BookStateService } from './book-state.service';
import type { IBook, ICharacter, ILocation, IPlotEvent, IChapter, ITheme, IProp, IRelationship, IWritingLog } from '../../types/data';
import { NotificationService } from './notification.service'; // <-- Import BARU

@Injectable({
  providedIn: 'root'
})
export class CurrentBookStateService {
  private readonly dbService = inject(DatabaseService);
  private readonly bookStateService = inject(BookStateService);
  private readonly notificationService = inject(NotificationService); // <-- Inject BARU

  // --- STATE PRIMER (Writable Signals) ---
  readonly currentBookId = signal<number | null>(null);
  readonly isLoadingBook = signal<boolean>(false); // Digunakan untuk pemuatan buku utama
  readonly isLoadingChildren = signal({ // Pemuatan data anak yang terpisah
      characters: false,
      locations: false,
      plotEvents: false,
      chapters: false,
      themes: false,
      props: false,
      writingLogs: false, 
  });
  
  readonly currentBook = signal<IBook | null>(null);
  readonly characters = signal<ICharacter[]>([]);
  readonly locations = signal<ILocation[]>([]);
  readonly plotEvents = signal<IPlotEvent[]>([]);
  readonly chapters = signal<IChapter[]>([]);
  readonly themes = signal<ITheme[]>([]);
  readonly props = signal<IProp[]>([]);
  readonly writingLogs = signal<IWritingLog[]>([]);

  // Helper untuk mendapatkan tanggal hari ini (YYYY-MM-DD)
  private getTodayDateString(): string {
      return new Date().toISOString().slice(0, 10);
  }

  // --- KOMPUTASI STATISTIK (Signal Computed) ---

  // Total kata yang ditulis hari ini
  readonly wordsWrittenToday = computed<number>(() => {
      const today = this.getTodayDateString();
      const logs = this.writingLogs();
      
      // Cari log hari ini
      const todayLog = logs.find(log => log.date === today);
      return todayLog ? todayLog.wordCountAdded : 0;
  });

  // Target kata per hari
  readonly dailyTarget = computed<number>(() => {
      return this.currentBook()?.dailyWordTarget ?? 0;
  });

  // Persentase progres harian
  readonly dailyProgressPercentage = computed<number>(() => {
      const target = this.dailyTarget();
      const written = this.wordsWrittenToday();
      
      if (target <= 0) return 0;
      return Math.min(100, Math.floor((written / target) * 100));
  });

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
    this.isLoadingBook.set(false);
    this.isLoadingChildren.set({
        characters: false,
        locations: false,
        plotEvents: false,
        chapters: false,
        themes: false,
        props: false,
        writingLogs: false, 
    });
    this.currentBook.set(null);
    this.characters.set([]);
    this.locations.set([]);
    this.plotEvents.set([]);
    this.chapters.set([]);
    this.themes.set([]);
    this.props.set([]);
    this.writingLogs.set([]);
  }

  /** Metode Private: Memuat data buku utama saja */
  private async loadBookCoreData(bookId: number): Promise<void> {
    this.isLoadingBook.set(true);
    try {
        const bookData = await this.dbService.getBookById(bookId);
        this.currentBook.set(bookData ?? null); 

        if (!bookData) {
            console.warn(`Buku dengan ID ${bookId} tidak ditemukan.`);
        }
    } catch (error) {
        console.error("Gagal memuat data buku inti:", error);
        this.notificationService.error("Gagal memuat detail novel.");
        this.currentBook.set(null);
    } finally {
        this.isLoadingBook.set(false);
    }
  }

  
  private async refreshChildData<T>(
    fetchFn: (bookId: number) => Promise<T[]>, 
    targetSignal: WritableSignal<T[]>,
    errorMessage: string = "Gagal memuat data",
  ): Promise<void> {
      const bookId = this.currentBookId();
      if (!bookId) return;
      try {
          const updatedList = await fetchFn(bookId);
          targetSignal.set(updatedList ?? []);
      } catch (error) {
          console.error(errorMessage, error);
          this.notificationService.error(errorMessage);
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
    this.isLoadingChildren.update(s => ({ ...s, characters: true }));
    try {
        const characters = await this.dbService.getCharactersByBookId(bookId);
        this.characters.set(characters ?? []);
    } catch (e) {
        console.error("Gagal load characters:", e);
        this.notificationService.error("Gagal memuat daftar karakter.");
        this.characters.set([]);
    } finally {
        this.isLoadingChildren.update(s => ({ ...s, characters: false }));
    }
  }

  async loadLocations(bookId: number): Promise<void> {
    this.isLoadingChildren.update(s => ({ ...s, locations: true }));
    try {
        const locations = await this.dbService.getLocationsByBookId(bookId);
        this.locations.set(locations ?? []);
    } catch (e) {
        console.error("Gagal load locations:", e);
        this.notificationService.error("Gagal memuat daftar lokasi.");
        this.locations.set([]);
    } finally {
        this.isLoadingChildren.update(s => ({ ...s, locations: false }));
    }
  }

  async loadPlotEvents(bookId: number): Promise<void> {
    this.isLoadingChildren.update(s => ({ ...s, plotEvents: true }));
    try {
        const plotEvents = await this.dbService.getPlotEventsByBookId(bookId);
        this.plotEvents.set(plotEvents ?? []);
    } catch (e) {
        console.error("Gagal load plot events:", e);
        this.notificationService.error("Gagal memuat event plot.");
        this.plotEvents.set([]);
    } finally {
        this.isLoadingChildren.update(s => ({ ...s, plotEvents: false }));
    }
  }

  async loadChapters(bookId: number): Promise<void> {
    this.isLoadingChildren.update(s => ({ ...s, chapters: true }));
    try {
        const chapters = await this.dbService.getChaptersByBookId(bookId);
        this.chapters.set(chapters ?? []);
    } catch (e) {
        console.error("Gagal load chapters:", e);
        this.notificationService.error("Gagal memuat bab.");
        this.chapters.set([]);
    } finally {
        this.isLoadingChildren.update(s => ({ ...s, chapters: false }));
    }
  }

  async loadThemes(bookId: number): Promise<void> {
    this.isLoadingChildren.update(s => ({ ...s, themes: true }));
    try {
        const themes = await this.dbService.getThemesByBookId(bookId);
        this.themes.set(themes ?? []);
    } catch (e) {
        console.error("Gagal load themes:", e);
        this.notificationService.error("Gagal memuat tema.");
        this.themes.set([]);
    } finally {
        this.isLoadingChildren.update(s => ({ ...s, themes: false }));
    }
  }

  async loadProps(bookId: number): Promise<void> {
    this.isLoadingChildren.update(s => ({ ...s, props: true }));
    try {
        const props = await this.dbService.getPropsByBookId(bookId);
        this.props.set(props ?? []);
    } catch (e) {
        console.error("Gagal load props:", e);
        this.notificationService.error("Gagal memuat properti.");
        this.props.set([]);
    } finally {
        this.isLoadingChildren.update(s => ({ ...s, props: false }));
    }
  }
  
  async loadWritingLogs(bookId: number): Promise<void> {
    this.isLoadingChildren.update(s => ({ ...s, writingLogs: true }));
    try {
        const logs = await this.dbService.getWritingLogsByBookId(bookId);
        this.writingLogs.set(logs ?? []);
    } catch (e) {
        console.error("Gagal load writing logs:", e);
        this.notificationService.error("Gagal memuat log penulisan.");
        this.writingLogs.set([]);
    } finally {
        this.isLoadingChildren.update(s => ({ ...s, writingLogs: false }));
    }
  }


  // --- CRUD Actions ---

  // Character Actions
  async addCharacter(name: string, description: string, relationships: IRelationship[]): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      await this.dbService.addCharacter({ bookId, name, description, relationships });
      await this.refreshChildData(this.dbService.getCharactersByBookId.bind(this.dbService), this.characters, "Gagal memuat karakter terbaru");
      this.notificationService.success(`Karakter "${name}" berhasil ditambahkan.`);
    } catch(error) { 
      console.error("addCharacter error:", error); 
      this.notificationService.error(`Gagal menambahkan karakter "${name}".`);
    }
  }
  async updateCharacter(id: number, data: { name: string, description: string, relationships: IRelationship[] }): Promise<void> {
    if (!this.currentBookId()) return;
    try {
      await this.dbService.updateCharacter(id, data);
      await this.refreshChildData(this.dbService.getCharactersByBookId.bind(this.dbService), this.characters, "Gagal memuat karakter terbaru");
      this.notificationService.success(`Karakter "${data.name}" berhasil diperbarui.`);
    } catch(error) { 
      console.error("updateCharacter error:", error); 
      this.notificationService.error(`Gagal memperbarui karakter "${data.name}".`);
    }
  }
  async deleteCharacter(id: number): Promise<void> {
     if (!this.currentBookId()) return;
     // Dapatkan nama karakter sebelum dihapus
     const charName = this.characters().find(c => c.id === id)?.name ?? 'Karakter';
     try {
       await this.dbService.deleteCharacter(id);
       await this.refreshChildData(this.dbService.getCharactersByBookId.bind(this.dbService), this.characters, "Gagal memuat karakter terbaru");
       this.notificationService.success(`Karakter "${charName}" berhasil dihapus.`);
     } catch(error) { 
       console.error("deleteCharacter error:", error); 
       this.notificationService.error(`Gagal menghapus karakter "${charName}".`);
     }
  }

  // Location Actions
  async addLocation(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      await this.dbService.addLocation({ bookId, name, description });
      await this.refreshChildData(this.dbService.getLocationsByBookId.bind(this.dbService), this.locations, "Gagal memuat lokasi terbaru");
      this.notificationService.success(`Lokasi "${name}" berhasil ditambahkan.`);
    } catch(error) { 
      console.error("addLocation error:", error); 
      this.notificationService.error(`Gagal menambahkan lokasi "${name}".`);
    }
  }
  async updateLocation(id: number, data: { name: string, description: string }): Promise<void> {
    if (!this.currentBookId()) return;
    try {
      await this.dbService.updateLocation(id, data);
      await this.refreshChildData(this.dbService.getLocationsByBookId.bind(this.dbService), this.locations, "Gagal memuat lokasi terbaru");
      this.notificationService.success(`Lokasi "${data.name}" berhasil diperbarui.`);
    } catch(error) { 
      console.error("updateLocation error:", error); 
      this.notificationService.error(`Gagal memperbarui lokasi "${data.name}".`);
    }
  }
  async deleteLocation(id: number): Promise<void> {
     if (!this.currentBookId()) return;
     const locName = this.locations().find(l => l.id === id)?.name ?? 'Lokasi';
     try {
       await this.dbService.deleteLocation(id);
       await this.refreshChildData(this.dbService.getLocationsByBookId.bind(this.dbService), this.locations, "Gagal memuat lokasi terbaru");
       this.notificationService.success(`Lokasi "${locName}" berhasil dihapus.`);
     } catch(error) { 
       console.error("deleteLocation error:", error); 
       this.notificationService.error(`Gagal menghapus lokasi "${locName}".`);
     }
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
      await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this.plotEvents, "Gagal memuat event plot terbaru");
      this.notificationService.success(`Event "${title}" berhasil ditambahkan.`);
    } catch(error) { 
      console.error("addPlotEvent error:", error); 
      this.notificationService.error(`Gagal menambahkan event "${title}".`);
    }
  }
  async updatePlotEvent(id: number, data: { title: string, summary: string, locationId: number | null, characterIds: number[] }): Promise<void> {
    if (!this.currentBookId()) return;
    try {
      await this.dbService.updatePlotEvent(id, data);
      await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this.plotEvents, "Gagal memuat event plot terbaru");
      this.notificationService.success(`Event "${data.title}" berhasil diperbarui.`);
    } catch(error) { 
      console.error("updatePlotEvent error:", error); 
      this.notificationService.error(`Gagal memperbarui event "${data.title}".`);
    }
  }
  async deletePlotEvent(id: number): Promise<void> {
     if (!this.currentBookId()) return;
     const eventTitle = this.plotEvents().find(e => e.id === id)?.title ?? 'Event Plot';
     try {
       await this.dbService.deletePlotEvent(id);
       await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this.plotEvents, "Gagal memuat event plot terbaru");
       this.notificationService.success(`Event "${eventTitle}" berhasil dihapus.`);
     } catch(error) { 
       console.error("deletePlotEvent error:", error); 
       this.notificationService.error(`Gagal menghapus event "${eventTitle}".`);
     }
  }

  // ACTIONS REORDER PLOT EVENT
  async reorderPlotEvents(reorderedEvents: IPlotEvent[]): Promise<void> {
    if (!this.currentBookId()) return;

    try {
        await this.dbService.updatePlotEventOrder(reorderedEvents);
        this.plotEvents.set(reorderedEvents); 
        this.notificationService.success("Urutan event plot berhasil disimpan.");
    } catch(error) { 
        console.error("reorderPlotEvents error:", error); 
        this.notificationService.error("Gagal menyimpan urutan event plot.");
        await this.refreshChildData(this.dbService.getPlotEventsByBookId.bind(this.dbService), this.plotEvents, "Gagal memuat ulang event plot");
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
      await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters, "Gagal memuat bab terbaru");
      this.notificationService.success(`Bab "${title}" berhasil dibuat.`);
    } catch(error) { 
      console.error("addChapter error:", error); 
      this.notificationService.error(`Gagal membuat bab "${title}".`);
    }
  }
  async updateChapterTitle(id: number, title: string, characterIds: number[]): Promise<void> {
    if (!this.currentBookId()) return;
    try {
      await this.dbService.updateChapter(id, { title, characterIds });
      await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters, "Gagal memuat bab terbaru");
      this.notificationService.success(`Bab "${title}" berhasil diperbarui.`);
    } catch(error) { 
      console.error("updateChapterTitle error:", error); 
      this.notificationService.error(`Gagal memperbarui bab "${title}".`);
    }
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
      
      await this._recalculateAndUpdateWordCount();
      // this.notificationService.success("Progress disimpan.", 1000); // Notif cepat // Dihapus karena notif dari editor
    } catch(error) { 
      console.error("updateChapterContent error:", error);
      this.notificationService.error("Gagal menyimpan konten bab.");
      await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters, "Gagal memuat ulang bab");
    }
  }
  async deleteChapter(id: number): Promise<void> {
     if (!this.currentBookId()) return;
     const chapTitle = this.chapters().find(c => c.id === id)?.title ?? 'Bab';
     try {
       await this.dbService.deleteChapter(id);
       await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters, "Gagal memuat bab terbaru");
       await this._recalculateAndUpdateWordCount();
       this.notificationService.success(`Bab "${chapTitle}" berhasil dihapus.`);
     } catch(error) { 
       console.error("deleteChapter error:", error); 
       this.notificationService.error(`Gagal menghapus bab "${chapTitle}".`);
     }
  }
  
  // ACTIONS REORDER CHAPTERS
  async reorderChapters(reorderedChapters: IChapter[]): Promise<void> {
    if (!this.currentBookId()) return;

    try {
        await this.dbService.updateChapterOrder(reorderedChapters);
        this.chapters.set(reorderedChapters);
        this.notificationService.success("Urutan bab berhasil disimpan.");
    } catch(error) { 
        console.error("reorderChapters error:", error); 
        this.notificationService.error("Gagal menyimpan urutan bab.");
        await this.refreshChildData(this.dbService.getChaptersByBookId.bind(this.dbService), this.chapters, "Gagal memuat ulang bab");
    }
  }
  
  // --- Themes ---
  async addTheme(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return; 
    try {
      await this.dbService.addTheme({ bookId, name, description });
      await this.refreshChildData(this.dbService.getThemesByBookId.bind(this.dbService), this.themes, "Gagal memuat tema terbaru");
      this.notificationService.success(`Tema "${name}" berhasil ditambahkan.`);
    } catch(error) { 
      console.error("addTheme error:", error); 
      this.notificationService.error(`Gagal menambahkan tema "${name}".`);
    }
  }
  async updateTheme(id: number, data: { name: string, description: string }): Promise<void> {
    if (!this.currentBookId()) return; 
    try {
      await this.dbService.updateTheme(id, data);
      await this.refreshChildData(this.dbService.getThemesByBookId.bind(this.dbService), this.themes, "Gagal memuat tema terbaru");
      this.notificationService.success(`Tema "${data.name}" berhasil diperbarui.`);
    } catch(error) { 
      console.error("updateTheme error:", error); 
      this.notificationService.error(`Gagal memperbarui tema "${data.name}".`);
    }
  }
  async deleteTheme(id: number): Promise<void> {
     if (!this.currentBookId()) return; 
     const themeName = this.themes().find(t => t.id === id)?.name ?? 'Tema';
     try {
       await this.dbService.deleteTheme(id);
       await this.refreshChildData(this.dbService.getThemesByBookId.bind(this.dbService), this.themes, "Gagal memuat tema terbaru");
       this.notificationService.success(`Tema "${themeName}" berhasil dihapus.`);
     } catch(error) { 
       console.error("deleteTheme error:", error); 
       this.notificationService.error(`Gagal menghapus tema "${themeName}".`);
     }
  }

  // --- Props ---
   async addProp(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return; 
    try {
      await this.dbService.addProp({ bookId, name, description });
      await this.refreshChildData(this.dbService.getPropsByBookId.bind(this.dbService), this.props, "Gagal memuat properti terbaru");
      this.notificationService.success(`Properti "${name}" berhasil ditambahkan.`);
    } catch(error) { 
      console.error("addProp error:", error); 
      this.notificationService.error(`Gagal menambahkan properti "${name}".`);
    }
  }
  async updateProp(id: number, data: { name: string, description: string }): Promise<void> {
    if (!this.currentBookId()) return; 
    try {
      await this.dbService.updateProp(id, data);
      await this.refreshChildData(this.dbService.getPropsByBookId.bind(this.dbService), this.props, "Gagal memuat properti terbaru");
      this.notificationService.success(`Properti "${data.name}" berhasil diperbarui.`);
    } catch(error) { 
      console.error("updateProp error:", error); 
      this.notificationService.error(`Gagal memperbarui properti "${data.name}".`);
    }
  }
  async deleteProp(id: number): Promise<void> {
     if (!this.currentBookId()) return; 
     const propName = this.props().find(p => p.id === id)?.name ?? 'Properti';
     try {
       await this.dbService.deleteProp(id);
       await this.refreshChildData(this.dbService.getPropsByBookId.bind(this.dbService), this.props, "Gagal memuat properti terbaru");
       this.notificationService.success(`Properti "${propName}" berhasil dihapus.`);
     } catch(error) { 
       console.error("deleteProp error:", error);
       this.notificationService.error(`Gagal menghapus properti "${propName}".`);
     }
  }
  
  // --- FUNGSI BARU UNTUK WORD COUNT ---

  private _countWordsInChapterContent(content: string): number {
    if (!content) return 0;
    try {
      if (content.trim().startsWith('{')) {
        const delta = JSON.parse(content);
        if (delta && Array.isArray(delta.ops)) {
          return delta.ops.reduce((count: number, op: any) => {
            if (typeof op.insert === 'string') {
              const words = op.insert.trim().split(/\s+/).filter(Boolean);
              return count + words.length;
            }
            return count;
          }, 0);
        }
      }
    } catch(e) { /* Fallback to plain text */ }

    return content.trim().split(/\s+/).filter(Boolean).length;
  }

  private async _recalculateAndUpdateWordCount(): Promise<void> {
    const book = this.currentBook();
    const bookId = this.currentBookId();
    if (!book || !bookId) return;

    const oldTotalWordCount = book.wordCount;
    const allChapters = this.chapters();
    const newTotalWordCount = allChapters.reduce((total, chap) => total + this._countWordsInChapterContent(chap.content), 0);
    
    const wordCountChange = newTotalWordCount - oldTotalWordCount;

    if (wordCountChange !== 0) {
      try {
        // 1. Update total kata di database
        await this.dbService.updateBookStats(bookId, { wordCount: newTotalWordCount });
        
        // 2. Update state buku saat ini secara optimis
        this.currentBook.update(current => current ? { ...current, wordCount: newTotalWordCount } : null);

        // 3. Update state buku di daftar utama (dashboard)
        this.bookStateService.updateBookInList(bookId, { wordCount: newTotalWordCount });

        // 4. Catat perubahan ke log harian
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        await this.dbService.upsertWritingLog(bookId, today, wordCountChange);
        
        // 5. Muat ulang log untuk memperbarui UI
        await this.loadWritingLogs(bookId);

      } catch (error) {
        console.error("Gagal update jumlah kata dan log:", error);
        this.notificationService.error("Gagal memperbarui statistik jumlah kata.");
      }
    }
  }

}
