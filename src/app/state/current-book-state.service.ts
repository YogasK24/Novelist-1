// src/app/state/current-book-state.service.ts

import { Injectable, inject, signal, effect, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import { BookDataSyncService } from './book-data-sync.service';
import type { IBook, ICharacter, ILocation, IPlotEvent, IChapter, ITheme, IProp, IRelationship, IWritingLog } from '../../types/data';
import { NotificationService } from './notification.service'; 

@Injectable({
  providedIn: 'root'
})
export class CurrentBookStateService {
  private readonly dbService = inject(DatabaseService);
  private readonly bookDataSyncService = inject(BookDataSyncService);
  private readonly notificationService = inject(NotificationService); 

  // --- STATE PRIMER (Writable Signals) ---
  readonly currentBookId = signal<number | null>(null);
  readonly isLoadingBook = signal<boolean>(false); 

  // --- REFACTOR: isLoadingChildren is split into individual signals ---
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

  // --- NEW: State for Contextual Search ---
  readonly contextualSearchTerm = signal('');

  // --- NEW: Computed Signals for Filtering ---

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


  // Helper to get today's date (YYYY-MM-DD)
  private getTodayDateString(): string {
      return new Date().toISOString().slice(0, 10);
  }

  // --- STATS COMPUTATION (Computed Signal) ---

  // Total words written today
  readonly wordsWrittenToday = computed<number>(() => {
      const today = this.getTodayDateString();
      const logs = this.writingLogs();
      
      // Find today's log
      const todayLog = logs.find(log => log.date === today);
      return todayLog ? todayLog.wordCountAdded : 0;
  });

  // Daily word target
  readonly dailyTarget = computed<number>(() => {
      return this.currentBook()?.dailyWordTarget ?? 0;
  });

  // Daily progress percentage
  readonly dailyProgressPercentage = computed<number>(() => {
      const target = this.dailyTarget();
      const written = this.wordsWrittenToday();
      
      if (target <= 0) return 0;
      return Math.min(100, Math.floor((written / target) * 100));
  });

  // --- RELATIONSHIP COMPUTATION (Computed Signal) ---
  // 1. Character ID -> Character Object Map
  readonly characterMap = computed<Map<number, ICharacter>>(() => {
    const map = new Map<number, ICharacter>();
    for (const char of this.characters()) {
      if (char.id != null) {
        map.set(char.id, char);
      }
    }
    return map;
  });

  // 2. Location ID -> Location Object Map
  readonly locationMap = computed<Map<number, ILocation>>(() => {
    const map = new Map<number, ILocation>();
    for (const loc of this.locations()) {
      if (loc.id != null) {
        map.set(loc.id, loc);
      }
    }
    return map;
  });
  
  // 3. Location ID -> Location Name Map (If name is needed more often)
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
        this.loadBookCoreData(bookId); // Call core data load
      } else {
        this.resetState();
      }
    });

    // --- NEW: Subscribe to entity changes ---
    this.subscribeToEntityChanges();
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

  private subscribeToEntityChanges(): void {
    // Characters
    this.bookDataSyncService.characterAdded$.subscribe(char => {
      if (char.bookId === this.currentBookId()) this.characters.update(list => [...list, char]);
    });
    this.bookDataSyncService.characterUpdated$.subscribe(char => {
      if (char.bookId === this.currentBookId()) this.characters.update(list => list.map(c => c.id === char.id ? char : c));
    });
    this.bookDataSyncService.characterDeleted$.subscribe(id => this.characters.update(list => list.filter(c => c.id !== id)));

    // Locations
    this.bookDataSyncService.locationAdded$.subscribe(loc => {
      if (loc.bookId === this.currentBookId()) this.locations.update(list => [...list, loc]);
    });
    this.bookDataSyncService.locationUpdated$.subscribe(loc => {
      if (loc.bookId === this.currentBookId()) this.locations.update(list => list.map(l => l.id === loc.id ? loc : l));
    });
    this.bookDataSyncService.locationDeleted$.subscribe(id => this.locations.update(list => list.filter(l => l.id !== id)));

    // Plot Events
    this.bookDataSyncService.plotEventAdded$.subscribe(event => {
      if (event.bookId === this.currentBookId()) this.plotEvents.update(list => [...list, event].sort((a, b) => a.order - b.order));
    });
    this.bookDataSyncService.plotEventUpdated$.subscribe(event => {
      if (event.bookId === this.currentBookId()) this.plotEvents.update(list => list.map(e => e.id === event.id ? event : e));
    });
    this.bookDataSyncService.plotEventDeleted$.subscribe(id => this.plotEvents.update(list => list.filter(e => e.id !== id)));

    // Chapters
    this.bookDataSyncService.chapterAdded$.subscribe(chap => {
      if (chap.bookId === this.currentBookId()) this.chapters.update(list => [...list, chap].sort((a, b) => a.order - b.order));
    });
    this.bookDataSyncService.chapterUpdated$.subscribe(chap => {
      if (chap.bookId === this.currentBookId()) this.chapters.update(list => list.map(c => c.id === chap.id ? chap : c));
    });
    this.bookDataSyncService.chapterDeleted$.subscribe(id => this.chapters.update(list => list.filter(c => c.id !== id)));
    
    // Themes
    this.bookDataSyncService.themeAdded$.subscribe(theme => {
        if (theme.bookId === this.currentBookId()) this.themes.update(list => [...list, theme]);
    });
    this.bookDataSyncService.themeUpdated$.subscribe(theme => {
        if (theme.bookId === this.currentBookId()) this.themes.update(list => list.map(t => t.id === theme.id ? theme : t));
    });
    this.bookDataSyncService.themeDeleted$.subscribe(id => this.themes.update(list => list.filter(t => t.id !== id)));

    // Props
    this.bookDataSyncService.propAdded$.subscribe(prop => {
        if (prop.bookId === this.currentBookId()) this.props.update(list => [...list, prop]);
    });
    this.bookDataSyncService.propUpdated$.subscribe(prop => {
        if (prop.bookId === this.currentBookId()) this.props.update(list => list.map(p => p.id === prop.id ? prop : p));
    });
    this.bookDataSyncService.propDeleted$.subscribe(id => this.props.update(list => list.filter(p => p.id !== id)));
  }

  /** Private Method: Loads only the main book data */
  private async loadBookCoreData(bookId: number): Promise<void> {
    this.isLoadingBook.set(true);
    try {
        const bookData = await this.dbService.getBookById(bookId);
        this.currentBook.set(bookData ?? null); 

        if (!bookData) {
            console.warn(`Book with ID ${bookId} not found.`);
        }
    } catch (error) {
        console.error("Failed to load core book data:", error);
        this.notificationService.error("Failed to load novel details.");
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

  // --- NEW: Action for Contextual Search ---
  setContextualSearchTerm(term: string): void {
    this.contextualSearchTerm.set(term);
  }

  clearContextualSearch(): void {
    this.contextualSearchTerm.set('');
  }

  // --- Public Actions for Lazy Loading Child Data ---
  async loadCharacters(bookId: number): Promise<void> {
    if (this.characters().length > 0 && this.characters()[0].bookId === bookId) return;
    this.isLoadingCharacters.set(true);
    try {
        const characters = await this.dbService.getCharactersByBookId(bookId);
        this.characters.set(characters ?? []);
    } catch (e) {
        console.error("Failed to load characters:", e);
        this.notificationService.error("Failed to load character list.");
        this.characters.set([]);
    } finally {
        this.isLoadingCharacters.set(false);
    }
  }

  async loadLocations(bookId: number): Promise<void> {
    if (this.locations().length > 0 && this.locations()[0].bookId === bookId) return;
    this.isLoadingLocations.set(true);
    try {
        const locations = await this.dbService.getLocationsByBookId(bookId);
        this.locations.set(locations ?? []);
    } catch (e) {
        console.error("Failed to load locations:", e);
        this.notificationService.error("Failed to load location list.");
        this.locations.set([]);
    } finally {
        this.isLoadingLocations.set(false);
    }
  }

  async loadPlotEvents(bookId: number): Promise<void> {
    if (this.plotEvents().length > 0 && this.plotEvents()[0].bookId === bookId) return;
    this.isLoadingPlotEvents.set(true);
    try {
        const plotEvents = await this.dbService.getPlotEventsByBookId(bookId);
        this.plotEvents.set(plotEvents ?? []);
    } catch (e) {
        console.error("Failed to load plot events:", e);
        this.notificationService.error("Failed to load plot events.");
        this.plotEvents.set([]);
    } finally {
        this.isLoadingPlotEvents.set(false);
    }
  }

  async loadChapters(bookId: number): Promise<void> {
    if (this.chapters().length > 0 && this.chapters()[0].bookId === bookId) return;
    this.isLoadingChapters.set(true);
    try {
        const chapters = await this.dbService.getChaptersByBookId(bookId);
        this.chapters.set(chapters ?? []);
    } catch (e) {
        console.error("Failed to load chapters:", e);
        this.notificationService.error("Failed to load chapters.");
        this.chapters.set([]);
    } finally {
        this.isLoadingChapters.set(false);
    }
  }

  async loadThemes(bookId: number): Promise<void> {
    if (this.themes().length > 0 && this.themes()[0].bookId === bookId) return;
    this.isLoadingThemes.set(true);
    try {
        const themes = await this.dbService.getThemesByBookId(bookId);
        this.themes.set(themes ?? []);
    } catch (e) {
        console.error("Failed to load themes:", e);
        this.notificationService.error("Failed to load themes.");
        this.themes.set([]);
    } finally {
        this.isLoadingThemes.set(false);
    }
  }

  async loadProps(bookId: number): Promise<void> {
    if (this.props().length > 0 && this.props()[0].bookId === bookId) return;
    this.isLoadingProps.set(true);
    try {
        const props = await this.dbService.getPropsByBookId(bookId);
        this.props.set(props ?? []);
    } catch (e) {
        console.error("Failed to load props:", e);
        this.notificationService.error("Failed to load props.");
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
        console.error("Failed to load writing logs:", e);
        this.notificationService.error("Failed to load writing logs.");
        this.writingLogs.set([]);
    } finally {
        this.isLoadingWritingLogs.set(false);
    }
  }
  
  // --- REFACTORED CRUD Actions ---

  // Character Actions
  async addCharacter(name: string, description: string, relationships: IRelationship[]): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      const newId = await this.dbService.addCharacter({ bookId, name, description, relationships });
      if (newId) {
        const newCharacter = await this.dbService.getCharacterById(newId);
        if (newCharacter) {
          this.bookDataSyncService.notifyCharacterAdded(newCharacter);
          this.bookDataSyncService.notifyCountChange(bookId, 'characterCount', 1);
          this.notificationService.success(`Character "${name}" was added.`);
        }
      }
    } catch (e) { this.notificationService.error(`Failed to add character "${name}".`); }
  }
  async updateCharacter(id: number, data: { name: string, description: string, relationships: IRelationship[] }): Promise<void> {
    try {
      await this.dbService.updateCharacter(id, data);
      const updatedCharacter = await this.dbService.getCharacterById(id);
      if (updatedCharacter) {
        this.bookDataSyncService.notifyCharacterUpdate(updatedCharacter);
        this.notificationService.success(`Character "${data.name}" was updated.`);
      }
    } catch (e) { this.notificationService.error(`Failed to update character "${data.name}".`); }
  }
  async deleteCharacter(id: number): Promise<void> {
     const bookId = this.currentBookId();
     if (!bookId) return;
     const charName = this.characters().find(c => c.id === id)?.name ?? 'Character';
     try {
       await this.dbService.deleteCharacter(id);
       this.bookDataSyncService.notifyCharacterDeleted(id);
       this.bookDataSyncService.notifyCountChange(bookId, 'characterCount', -1);
       this.notificationService.success(`Character "${charName}" was deleted.`);
     } catch (e) { this.notificationService.error(`Failed to delete character "${charName}".`); }
  }

  // Location Actions
  async addLocation(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      const newId = await this.dbService.addLocation({ bookId, name, description });
      if (newId) {
        const newLocation = await this.dbService.getLocationById(newId);
        if (newLocation) {
          this.bookDataSyncService.notifyLocationAdded(newLocation);
          this.notificationService.success(`Location "${name}" was added.`);
        }
      }
    } catch (e) { this.notificationService.error(`Failed to add location "${name}".`); }
  }
  async updateLocation(id: number, data: { name: string, description: string }): Promise<void> {
    try {
      await this.dbService.updateLocation(id, data);
      const updatedLocation = await this.dbService.getLocationById(id);
      if (updatedLocation) {
        this.bookDataSyncService.notifyLocationUpdate(updatedLocation);
        this.notificationService.success(`Location "${data.name}" was updated.`);
      }
    } catch (e) { this.notificationService.error(`Failed to update location "${data.name}".`); }
  }
  async deleteLocation(id: number): Promise<void> {
     const locName = this.locations().find(l => l.id === id)?.name ?? 'Location';
     try {
       await this.dbService.deleteLocation(id);
       this.bookDataSyncService.notifyLocationDeleted(id);
       this.notificationService.success(`Location "${locName}" was deleted.`);
     } catch (e) { this.notificationService.error(`Failed to delete location "${locName}".`); }
  }

  // Plot Event Actions
  async addPlotEvent(title: string, summary: string, locationId: number | null, characterIds: number[]): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      const currentEvents = await this.dbService.getPlotEventsByBookId(bookId);
      const maxOrder = currentEvents.reduce((max, event) => Math.max(max, event.order), 0);
      const newId = await this.dbService.addPlotEvent({ bookId, title, summary, order: maxOrder + 1, locationId, characterIds });
      if (newId) {
        const newEvent = await this.dbService.getPlotEventById(newId);
        if (newEvent) {
          this.bookDataSyncService.notifyPlotEventAdded(newEvent);
          this.notificationService.success(`Event "${title}" was added.`);
        }
      }
    } catch (e) { this.notificationService.error(`Failed to add event "${title}".`); }
  }
  async updatePlotEvent(id: number, data: { title: string, summary: string, locationId: number | null, characterIds: number[] }): Promise<void> {
    try {
      await this.dbService.updatePlotEvent(id, data);
      const updatedEvent = await this.dbService.getPlotEventById(id);
      if (updatedEvent) {
        this.bookDataSyncService.notifyPlotEventUpdate(updatedEvent);
        this.notificationService.success(`Event "${data.title}" was updated.`);
      }
    } catch (e) { this.notificationService.error(`Failed to update event "${data.title}".`); }
  }
  async deletePlotEvent(id: number): Promise<void> {
     const eventTitle = this.plotEvents().find(e => e.id === id)?.title ?? 'Plot Event';
     try {
       await this.dbService.deletePlotEvent(id);
       this.bookDataSyncService.notifyPlotEventDeleted(id);
       this.notificationService.success(`Event "${eventTitle}" was deleted.`);
     } catch (e) { this.notificationService.error(`Failed to delete event "${eventTitle}".`); }
  }
  async reorderPlotEvents(reorderedEvents: IPlotEvent[]): Promise<void> {
    if (!this.currentBookId()) return;
    try {
        await this.dbService.updatePlotEventOrder(reorderedEvents);
        this.plotEvents.set(reorderedEvents); 
        this.notificationService.success("Plot event order saved.");
    } catch(error) { 
        this.notificationService.error("Failed to save plot event order.");
        await this.loadPlotEvents(this.currentBookId()!);
    }
  }

  // Chapter Actions
  async addChapter(title: string, characterIds: number[]): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      const currentChapters = await this.dbService.getChaptersByBookId(bookId);
      const maxOrder = currentChapters.reduce((max, chap) => Math.max(max, chap.order), 0);
      const newId = await this.dbService.addChapter({ bookId, title, content: "", order: maxOrder + 1, characterIds });
      if (newId) {
        const newChapter = await this.dbService.getChapterById(newId);
        if (newChapter) {
          this.bookDataSyncService.notifyChapterAdded(newChapter);
          this.bookDataSyncService.notifyCountChange(bookId, 'chapterCount', 1);
          this.notificationService.success(`Chapter "${title}" was created.`);
        }
      }
    } catch(e) { this.notificationService.error(`Failed to create chapter "${title}".`); }
  }
  async updateChapterTitle(id: number, title: string, characterIds: number[]): Promise<void> {
    try {
      await this.dbService.updateChapter(id, { title, characterIds });
      const updatedChapter = await this.dbService.getChapterById(id);
      if (updatedChapter) {
        this.bookDataSyncService.notifyChapterUpdate(updatedChapter);
        this.notificationService.success(`Chapter "${title}" was updated.`);
      }
    } catch (e) { this.notificationService.error(`Failed to update chapter "${title}".`); }
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
      this.notificationService.error("Failed to save chapter content.");
      await this.loadChapters(this.currentBookId()!);
    }
  }
  async deleteChapter(id: number): Promise<void> {
     const bookId = this.currentBookId();
     if (!bookId) return;
     const chapTitle = this.chapters().find(c => c.id === id)?.title ?? 'Chapter';
     try {
       await this.dbService.deleteChapter(id);
       this.bookDataSyncService.notifyChapterDeleted(id);
       this.bookDataSyncService.notifyCountChange(bookId, 'chapterCount', -1);
       this.notificationService.success(`Chapter "${chapTitle}" was deleted.`);
       await this._recalculateAndUpdateWordCount();
     } catch(e) { this.notificationService.error(`Failed to delete chapter "${chapTitle}".`); }
  }
  async reorderChapters(reorderedChapters: IChapter[]): Promise<void> {
    if (!this.currentBookId()) return;
    try {
        await this.dbService.updateChapterOrder(reorderedChapters);
        this.chapters.set(reorderedChapters);
        this.notificationService.success("Chapter order saved.");
    } catch(error) { 
        this.notificationService.error("Failed to save chapter order.");
        await this.loadChapters(this.currentBookId()!);
    }
  }
  
  // --- Themes ---
  async addTheme(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      const newId = await this.dbService.addTheme({ bookId, name, description });
      if (newId) {
        const newTheme = await this.dbService.getThemeById(newId);
        if (newTheme) this.bookDataSyncService.notifyThemeAdded(newTheme);
        this.notificationService.success(`Theme "${name}" added.`);
      }
    } catch(e) { this.notificationService.error(`Failed to add theme "${name}".`); }
  }
  async updateTheme(id: number, data: { name: string, description: string }): Promise<void> {
    try {
      await this.dbService.updateTheme(id, data);
      const updatedTheme = await this.dbService.getThemeById(id);
      if (updatedTheme) this.bookDataSyncService.notifyThemeUpdate(updatedTheme);
      this.notificationService.success(`Theme "${data.name}" updated.`);
    } catch(e) { this.notificationService.error(`Failed to update theme "${data.name}".`); }
  }
  async deleteTheme(id: number): Promise<void> {
     const themeName = this.themes().find(t => t.id === id)?.name ?? 'Theme';
     try {
       await this.dbService.deleteTheme(id);
       this.bookDataSyncService.notifyThemeDeleted(id);
       this.notificationService.success(`Theme "${themeName}" deleted.`);
     } catch (e) { this.notificationService.error(`Failed to delete theme "${themeName}".`); }
  }

  // --- Props ---
   async addProp(name: string, description: string): Promise<void> {
    const bookId = this.currentBookId();
    if (!bookId) return;
    try {
      const newId = await this.dbService.addProp({ bookId, name, description });
      if (newId) {
        const newProp = await this.dbService.getPropById(newId);
        if (newProp) this.bookDataSyncService.notifyPropAdded(newProp);
        this.notificationService.success(`Prop "${name}" added.`);
      }
    } catch(e) { this.notificationService.error(`Failed to add prop "${name}".`); }
  }
  async updateProp(id: number, data: { name: string, description: string }): Promise<void> {
    try {
      await this.dbService.updateProp(id, data);
      const updatedProp = await this.dbService.getPropById(id);
      if (updatedProp) this.bookDataSyncService.notifyPropUpdate(updatedProp);
      this.notificationService.success(`Prop "${data.name}" updated.`);
    } catch(e) { this.notificationService.error(`Failed to update prop "${data.name}".`); }
  }
  async deleteProp(id: number): Promise<void> {
     const propName = this.props().find(p => p.id === id)?.name ?? 'Prop';
     try {
       await this.dbService.deleteProp(id);
       this.bookDataSyncService.notifyPropDeleted(id);
       this.notificationService.success(`Prop "${propName}" deleted.`);
     } catch (e) { this.notificationService.error(`Failed to delete prop "${propName}".`); }
  }
  
  // --- Word Count Logic ---
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
    } catch (e) { /* Fallback to plain text */ }
    return content.trim().split(/\s+/).filter(Boolean).length;
  }

  private async _recalculateAndUpdateWordCount(): Promise<void> {
    const bookId = this.currentBookId();
    const chapters = this.chapters();
    if (!bookId) return;

    try {
      const totalWordCount = chapters.reduce((total, chapter) => {
        return total + this._countWordsInChapterContent(chapter.content);
      }, 0);

      const previousTotalWordCount = this.currentBook()?.wordCount ?? 0;
      const wordCountChange = totalWordCount - previousTotalWordCount;
      
      if (wordCountChange !== 0) {
        const today = this.getTodayDateString();
        await this.dbService.upsertWritingLog(bookId, today, wordCountChange);
        await this.loadWritingLogs(bookId); 
      }
      
      if (totalWordCount !== previousTotalWordCount) {
          this.currentBook.update(book => book ? { ...book, wordCount: totalWordCount } : null);
          this.bookDataSyncService.notifyStatsUpdate(bookId, { wordCount: totalWordCount });
          await this.dbService.updateBookStats(bookId, { wordCount: totalWordCount });
      }
    } catch(error) {
      console.error("Failed to recalculate word count:", error);
      this.notificationService.error("Failed to update word count.");
    }
  }
}
