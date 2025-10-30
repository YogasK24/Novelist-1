// src/app/state/current-book-state.service.ts

import { Injectable, inject, signal, effect, WritableSignal, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import { BookStateService } from './book-state.service';
import type { IBook, ICharacter, ILocation, IPlotEvent, IChapter, ITheme, IProp, IRelationship, IWritingLog } from '../../types/data';
import { NotificationService } from './notification.service'; 

@Injectable({
  providedIn: 'root'
})
export class CurrentBookStateService {
  private readonly dbService = inject(DatabaseService);
  private readonly bookStateService = inject(BookStateService);
  private readonly notificationService = inject(NotificationService); 

  // --- STATE PRIMER (Writable Signals) ---
  readonly currentBookId = signal<number | null>(null);
  readonly isLoadingBook = signal<boolean>(false); 

  // --- REFACTOR: isLoadingChildren dipecah menjadi sinyal individual ---
  readonly isLoadingCharacters = signal(false);
  readonly isLoadingLocations = signal(false);
  readonly isLoadingPlotEvents = signal(false);
  readonly isLoadingChapters = signal(false);
  readonly isLoadingThemes = signal(false);
  readonly isLoadingProps = signal(false);
  readonly isLoadingWritingLogs = signal(false);
  
  readonly currentBook = signal<IBook | null>(null);
  readonly characters = signal<ICharacter[]>([]);
  readonly locations = signal<ILocation[]>([]);
  readonly plotEvents = signal<IPlotEvent[]>([]);
  readonly chapters = signal<IChapter[]>([]);
  readonly themes = signal<ITheme[]>([]);
  readonly props = signal<IProp[]>([]);
  readonly writingLogs = signal<IWritingLog[]>([]); 

  // --- BARU: State untuk Pencarian Kontekstual ---
  readonly contextualSearchTerm = signal('');

  // --- BARU: Computed Signals untuk Filtering ---

  readonly filteredCharacters = computed(() => {
    const term = this.contextualSearchTerm().toLowerCase();
    if (!term) return this.characters();
    return this.characters().filter(char =>
      char.name.toLowerCase().includes(term) ||
      char.description.toLowerCase().includes(term)
    );
  });

  readonly filteredLocations = computed(() => {
    const term = this.contextualSearchTerm().toLowerCase();
    if (!term) return this.locations();
    return this.locations().filter(loc =>
      loc.name.toLowerCase().includes(term) ||
      loc.description.toLowerCase().includes(term)
    );
  });
  
  readonly filteredPlotEvents = computed(() => {
    const term = this.contextualSearchTerm().toLowerCase();
    if (!term) return this.plotEvents();
    return this.plotEvents().filter(event =>
      event.title.toLowerCase().includes(term) ||
      event.summary.toLowerCase().includes(term)
    );
  });

  readonly filteredChapters = computed(() => {
    const term = this.contextualSearchTerm().toLowerCase();
    if (!term) return this.chapters();
    return this.chapters().filter(chap =>
      chap.title.toLowerCase().includes(term)
    );
  });

  readonly filteredThemes = computed(() => {
    const term = this.contextualSearchTerm().toLowerCase();
    if (!term) return this.themes();
    return this.themes().filter(theme =>
      theme.name.toLowerCase().includes(term) ||
      theme.description.toLowerCase().includes(term)
    );
  });

  readonly filteredProps = computed(() => {
    const term = this.contextualSearchTerm().toLowerCase();
    if (!term) return this.props();
    return this.props().filter(prop =>
      prop.name.toLowerCase().includes(term) ||
      prop.description.toLowerCase().includes(term)
    );
  });


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
    this.isLoadingCharacters.set(false);
    this.isLoadingLocations.set(false);
    this.isLoadingPlotEvents.set(false);
    this.isLoadingChapters.set(false);
    this.isLoadingThemes.set(false);
    this.isLoadingProps.set(false);
    this.isLoadingWritingLogs.set(false);
    this.currentBook.set(null);
    this.characters.set([]);
    this.locations.set([]);
    this.plotEvents.set([]);
    this.chapters.set([]);
    this.themes.set([]);
    this.props.set([]);
    this.writingLogs.set([]); 
    this.contextualSearchTerm.set(''); // <-- Reset search term
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

  // --- PUBLIC ACTIONS ---

  loadBookData(bookId: number): void {
     if (this.currentBookId() !== bookId) {
        this.currentBookId.set(bookId);
     }
  }

  clearBookData(): void {
    this.currentBookId.set(null);
  }

  // --- BARU: Aksi untuk Pencarian Kontekstual ---
  setContextualSearchTerm(term: string): void {
    this.contextualSearchTerm.set(term);
  }

  clearContextualSearch(): void {
    this.contextualSearchTerm.set('');
  }

  // --- Actions Publik untuk Lazy Loading Data Anak ---
  async loadCharacters(bookId: number): Promise<void> {
    this.isLoadingCharacters.set(true);
    try {
        const characters = await this.dbService.getCharactersByBookId(bookId);
        this.characters.set(characters ?? []);
    } catch (e) {
        console.error("Gagal load characters:", e);
        this.notificationService.error("Gagal memuat daftar karakter.");
        this.characters.set([]);
    } finally {
        this.isLoadingCharacters.set(false);
    }
  }

  async loadLocations(bookId: number): Promise<void> {
    this.isLoadingLocations.set(true);
    try {
        const locations = await this.dbService.getLocationsByBookId(bookId);
        this.locations.set(locations ?? []);
    } catch (e) {
        console.error("Gagal load locations:", e);
        this.notificationService.error("Gagal memuat daftar lokasi.");
        this.locations.set([]);
    } finally {
        this.isLoadingLocations.set(false);
    }
  }

  async loadPlotEvents(bookId: number): Promise<void> {
    this.isLoadingPlotEvents.set(true);
    try {
        const plotEvents = await this.dbService.getPlotEventsByBookId(bookId);
        this.plotEvents.set(plotEvents ?? []);
    } catch (e) {
        console.error("Gagal load plot events:", e);
        this.notificationService.error("Gagal memuat event plot.");
        this.plotEvents.set([]);
    } finally {
        this.isLoadingPlotEvents.set(false);
    }
  }

  async loadChapters(bookId: number): Promise<void> {
    this.isLoadingChapters.set(true);
    try {
        const chapters = await this.dbService.getChaptersByBookId(bookId);
        this.chapters.set(chapters ?? []);
    } catch (e) {
        console.error("Gagal load chapters:", e);
        this.notificationService.error("Gagal memuat bab.");
        this.chapters.set([]);
    } finally {
        this.isLoadingChapters.set(false);
    }
  }

  async loadThemes(bookId: number): Promise<void> {
    this.isLoadingThemes.set(true);
    try {
        const themes = await this.dbService.getThemesByBookId(bookId);
        this.themes.set(themes ?? []);
    } catch (e) {
        console.error("Gagal load themes:", e);
        this.notificationService.error("Gagal memuat tema.");
        this.themes.set([]);
    } finally {
        this.isLoadingThemes.set(false);
    }
  }

  async loadProps(bookId: number): Promise<void> {
    this.isLoadingProps.set(true);
    try {
        const props = await this.dbService.getPropsByBookId(bookId);
        this.props.set(props ?? []);
    } catch (e) {
        console.error("Gagal load props:", e);
        this.notificationService.error("Gagal memuat properti.");
        this.props.set([]);
    } finally {
        this.isLoadingProps.set(false);
    }
  }
  
  async loadWritingLogs(bookId: number): Promise<void> {
    this.isLoadingWritingLogs.set(true);
    try {
        const logs = await this.dbService.getWritingLogsByBookId(bookId);
        this.writingLogs.set(logs ?? []);
    } catch (e) {
        console.error("Gagal load writing logs:", e);
        this.notificationService.error("Gagal memuat log penulisan.");
        this.writingLogs.set([]);
    } finally {
        this.isLoadingWritingLogs.set(false);
    }
  }

  // --- REFACTOR: Generic CRUD Handler ---
  private async _handleCrud<T>(
    action: () => Promise<any>,
    refresh: { fetchFn: (bookId: number) => Promise<T[]>, targetSignal: WritableSignal<T[]> },
    messages: { success: string, error: string }
  ): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    
    try {
      await action();
      
      const updatedList = await refresh.fetchFn(bookId);
      refresh.targetSignal.set(updatedList ?? []);

      this.notificationService.success(messages.success);
    } catch (error) {
      console.error(messages.error, error);
      this.notificationService.error(messages.error);
    }
  }

  // --- CRUD Actions (Refactored) ---

  // Character Actions
  async addCharacter(name: string, description: string, relationships: IRelationship[]): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    await this._handleCrud(
      () => this.dbService.addCharacter({ bookId, name, description, relationships }),
      { fetchFn: this.dbService.getCharactersByBookId.bind(this.dbService), targetSignal: this.characters },
      { success: `Karakter "${name}" berhasil ditambahkan.`, error: `Gagal menambahkan karakter "${name}".` }
    );
  }
  async updateCharacter(id: number, data: { name: string, description: string, relationships: IRelationship[] }): Promise<void> {
    await this._handleCrud(
      () => this.dbService.updateCharacter(id, data),
      { fetchFn: this.dbService.getCharactersByBookId.bind(this.dbService), targetSignal: this.characters },
      { success: `Karakter "${data.name}" berhasil diperbarui.`, error: `Gagal memperbarui karakter "${data.name}".` }
    );
  }
  async deleteCharacter(id: number): Promise<void> {
     const charName = this.characters().find(c => c.id === id)?.name ?? 'Karakter';
     await this._handleCrud(
       () => this.dbService.deleteCharacter(id),
       { fetchFn: this.dbService.getCharactersByBookId.bind(this.dbService), targetSignal: this.characters },
       { success: `Karakter "${charName}" berhasil dihapus.`, error: `Gagal menghapus karakter "${charName}".` }
     );
  }

  // Location Actions
  async addLocation(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    await this._handleCrud(
      () => this.dbService.addLocation({ bookId, name, description }),
      { fetchFn: this.dbService.getLocationsByBookId.bind(this.dbService), targetSignal: this.locations },
      { success: `Lokasi "${name}" berhasil ditambahkan.`, error: `Gagal menambahkan lokasi "${name}".` }
    );
  }
  async updateLocation(id: number, data: { name: string, description: string }): Promise<void> {
    await this._handleCrud(
      () => this.dbService.updateLocation(id, data),
      { fetchFn: this.dbService.getLocationsByBookId.bind(this.dbService), targetSignal: this.locations },
      { success: `Lokasi "${data.name}" berhasil diperbarui.`, error: `Gagal memperbarui lokasi "${data.name}".` }
    );
  }
  async deleteLocation(id: number): Promise<void> {
     const locName = this.locations().find(l => l.id === id)?.name ?? 'Lokasi';
     await this._handleCrud(
       () => this.dbService.deleteLocation(id),
       { fetchFn: this.dbService.getLocationsByBookId.bind(this.dbService), targetSignal: this.locations },
       { success: `Lokasi "${locName}" berhasil dihapus.`, error: `Gagal menghapus lokasi "${locName}".` }
     );
  }

  // Plot Event Actions
  async addPlotEvent(title: string, summary: string, locationId: number | null, characterIds: number[]): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    const currentEvents = await this.dbService.getPlotEventsByBookId(bookId);
    const maxOrder = currentEvents.reduce((max, event) => Math.max(max, event.order), 0);
    const newOrder = maxOrder + 1;

    await this._handleCrud(
      () => this.dbService.addPlotEvent({ bookId, title, summary, order: newOrder, locationId, characterIds }),
      { fetchFn: this.dbService.getPlotEventsByBookId.bind(this.dbService), targetSignal: this.plotEvents },
      { success: `Event "${title}" berhasil ditambahkan.`, error: `Gagal menambahkan event "${title}".` }
    );
  }
  async updatePlotEvent(id: number, data: { title: string, summary: string, locationId: number | null, characterIds: number[] }): Promise<void> {
    await this._handleCrud(
      () => this.dbService.updatePlotEvent(id, data),
      { fetchFn: this.dbService.getPlotEventsByBookId.bind(this.dbService), targetSignal: this.plotEvents },
      { success: `Event "${data.title}" berhasil diperbarui.`, error: `Gagal memperbarui event "${data.title}".` }
    );
  }
  async deletePlotEvent(id: number): Promise<void> {
     const eventTitle = this.plotEvents().find(e => e.id === id)?.title ?? 'Event Plot';
     await this._handleCrud(
       () => this.dbService.deletePlotEvent(id),
       { fetchFn: this.dbService.getPlotEventsByBookId.bind(this.dbService), targetSignal: this.plotEvents },
       { success: `Event "${eventTitle}" berhasil dihapus.`, error: `Gagal menghapus event "${eventTitle}".` }
     );
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
        await this.loadPlotEvents(this.currentBookId()!);
    }
  }

  // Chapter Actions
  async addChapter(title: string, characterIds: number[]): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    const currentChapters = await this.dbService.getChaptersByBookId(bookId);
    const maxOrder = currentChapters.reduce((max, chap) => Math.max(max, chap.order), 0);
    const newOrder = maxOrder + 1;

    await this._handleCrud(
      () => this.dbService.addChapter({ bookId, title, content: "", order: newOrder, characterIds }),
      { fetchFn: this.dbService.getChaptersByBookId.bind(this.dbService), targetSignal: this.chapters },
      { success: `Bab "${title}" berhasil dibuat.`, error: `Gagal membuat bab "${title}".` }
    );
  }
  async updateChapterTitle(id: number, title: string, characterIds: number[]): Promise<void> {
    await this._handleCrud(
      () => this.dbService.updateChapter(id, { title, characterIds }),
      { fetchFn: this.dbService.getChaptersByBookId.bind(this.dbService), targetSignal: this.chapters },
      { success: `Bab "${title}" berhasil diperbarui.`, error: `Gagal memperbarui bab "${title}".` }
    );
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
    } catch(error) { 
      console.error("updateChapterContent error:", error);
      this.notificationService.error("Gagal menyimpan konten bab.");
      await this.loadChapters(this.currentBookId()!);
    }
  }
  async deleteChapter(id: number): Promise<void> {
     const chapTitle = this.chapters().find(c => c.id === id)?.title ?? 'Bab';
     await this._handleCrud(
       () => this.dbService.deleteChapter(id),
       { fetchFn: this.dbService.getChaptersByBookId.bind(this.dbService), targetSignal: this.chapters },
       { success: `Bab "${chapTitle}" berhasil dihapus.`, error: `Gagal menghapus bab "${chapTitle}".` }
     );
     await this._recalculateAndUpdateWordCount();
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
        await this.loadChapters(this.currentBookId()!);
    }
  }
  
  // --- Themes ---
  async addTheme(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    await this._handleCrud(
      () => this.dbService.addTheme({ bookId, name, description }),
      { fetchFn: this.dbService.getThemesByBookId.bind(this.dbService), targetSignal: this.themes },
      { success: `Tema "${name}" berhasil ditambahkan.`, error: `Gagal menambahkan tema "${name}".` }
    );
  }
  async updateTheme(id: number, data: { name: string, description: string }): Promise<void> {
    await this._handleCrud(
      () => this.dbService.updateTheme(id, data),
      { fetchFn: this.dbService.getThemesByBookId.bind(this.dbService), targetSignal: this.themes },
      { success: `Tema "${data.name}" berhasil diperbarui.`, error: `Gagal memperbarui tema "${data.name}".` }
    );
  }
  async deleteTheme(id: number): Promise<void> {
     const themeName = this.themes().find(t => t.id === id)?.name ?? 'Tema';
     await this._handleCrud(
       () => this.dbService.deleteTheme(id),
       { fetchFn: this.dbService.getThemesByBookId.bind(this.dbService), targetSignal: this.themes },
       { success: `Tema "${themeName}" berhasil dihapus.`, error: `Gagal menghapus tema "${themeName}".` }
     );
  }

  // --- Props ---
   async addProp(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    await this._handleCrud(
      () => this.dbService.addProp({ bookId, name, description }),
      { fetchFn: this.dbService.getPropsByBookId.bind(this.dbService), targetSignal: this.props },
      { success: `Properti "${name}" berhasil ditambahkan.`, error: `Gagal menambahkan properti "${name}".` }
    );
  }
  async updateProp(id: number, data: { name: string, description: string }): Promise<void> {
    await this._handleCrud(
      () => this.dbService.updateProp(id, data),
      { fetchFn: this.dbService.getPropsByBookId.bind(this.dbService), targetSignal: this.props },
      { success: `Properti "${data.name}" berhasil diperbarui.`, error: `Gagal memperbarui properti "${data.name}".` }
    );
  }
  async deleteProp(id: number): Promise<void> {
     const propName = this.props().find(p => p.id === id)?.name ?? 'Properti';
     await this._handleCrud(
       () => this.dbService.deleteProp(id),
       { fetchFn: this.dbService.getPropsByBookId.bind(this.dbService), targetSignal: this.props },
       { success: `Properti "${propName}" berhasil dihapus.`, error: `Gagal menghapus properti "${propName}".` }
     );
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
    } catch (e) {
      /* Fallback to plain text */
    }
    return content.trim().split(/\s+/).filter(Boolean).length;
  }

  private async _recalculateAndUpdateWordCount(): Promise<void> {
    const bookId = this.currentBookId();
    const chapters = this.chapters();
    if (!bookId) return;

    try {
      // 1. Hitung total kata dari semua bab
      const totalWordCount = chapters.reduce((total, chapter) => {
        return total + this._countWordsInChapterContent(chapter.content);
      }, 0);

      // 2. Hitung perubahan kata dari state buku saat ini
      const previousTotalWordCount = this.currentBook()?.wordCount ?? 0;
      const wordCountChange = totalWordCount - previousTotalWordCount;
      
      // 3. Update log penulisan HANYA jika ada perubahan
      if (wordCountChange !== 0) {
        const today = this.getTodayDateString();
        await this.dbService.upsertWritingLog(bookId, today, wordCountChange);
        await this.loadWritingLogs(bookId); // Muat ulang log
      }
      
      // 4. Update state buku saat ini & di daftar buku global
      if (totalWordCount !== previousTotalWordCount) {
          this.currentBook.update(book => book ? { ...book, wordCount: totalWordCount } : null);
          this.bookStateService.updateBookInList(bookId, { wordCount: totalWordCount });
          // Simpan ke DB
          await this.dbService.updateBookStats(bookId, { wordCount: totalWordCount });
      }

    } catch(error) {
      console.error("Gagal menghitung ulang word count:", error);
      this.notificationService.error("Gagal memperbarui jumlah kata.");
    }
  }

}