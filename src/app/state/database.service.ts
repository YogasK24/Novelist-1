// src/app/state/database.service.ts

import { Injectable } from '@angular/core'; // Import Injectable decorator
import Dexie, { type Table } from 'dexie';
// Ensure this import path is correct
import type { IBook, ICharacter, ILocation, IPlotEvent, IChapter, ITheme, IProp, IRelationship, IWritingLog, ISearchResult, SearchResultType } from '../../types/data'; // <-- Add ISearchResult

// --- DEFINE DATABASE SHAPE WITH AN INTERFACE ---
// This avoids subclassing issues with TypeScript's type inference for Dexie.
// The service will create an instance of Dexie and type it with this interface.
// FIX: Changed from `extends Dexie` to a plain interface. The db property will be typed
// as an intersection `Dexie & INovelistDB` to correctly combine Dexie's methods
// with the table properties, resolving errors on `version()` and `transaction()`.
interface INovelistDB {
  books: Table<IBook, number>;
  characters: Table<ICharacter, number>;
  locations: Table<ILocation, number>;
  plotEvents: Table<IPlotEvent, number>;
  chapters: Table<IChapter, number>;
  themes: Table<ITheme, number>;
  props: Table<IProp, number>;
  writingLogs: Table<IWritingLog, number>; // <-- NEW
}

@Injectable({
  providedIn: 'root' 
})
export class DatabaseService {
  // Instance Dexie database
  // FIX: Used an intersection type to ensure both Dexie methods and table properties are available.
  private db: Dexie & INovelistDB;

  constructor() {
    this.db = new Dexie('NovelistDB_Angular') as Dexie & INovelistDB;
    this.db.version(5).stores({
      books: '++id, title, lastModified',
      characters: '++id, bookId, name, *relationships.targetId',
      locations: '++id, bookId, name',
      plotEvents: '++id, bookId, order, locationId, *characterIds',
      chapters: '++id, bookId, order, *characterIds',
      themes: '++id, bookId, name',
      props: '++id, bookId, name'
    });
    
    this.db.version(6).stores({
      books: '++id, title, lastModified',
      characters: '++id, bookId, name, *relationships.targetId',
      locations: '++id, bookId, name',
      plotEvents: '++id, bookId, order, locationId, *characterIds',
      chapters: '++id, bookId, order, *characterIds',
      themes: '++id, bookId, name',
      props: '++id, bookId, name',
      writingLogs: '++id, bookId, date, &[bookId+date]' 
    });
    
    // --- NEW: Version 7 -> Add Search Indexes ---
    this.db.version(7).stores({
      books: '++id, title, lastModified',
      characters: '++id, bookId, name, *relationships.targetId',
      locations: '++id, bookId, name',
      plotEvents: '++id, bookId, order, title, locationId, *characterIds', // <-- Add 'title'
      chapters: '++id, bookId, order, title, *characterIds', // <-- Add 'title'
      themes: '++id, bookId, name',
      props: '++id, bookId, name',
      writingLogs: '++id, bookId, date, &[bookId+date]'
    });

    // --- NEW: Version 8 -> Add Pin/Archive Indexes ---
    this.db.version(8).stores({
      books: '++id, title, lastModified, isArchived, isPinned',
      characters: '++id, bookId, name, *relationships.targetId',
      locations: '++id, bookId, name',
      plotEvents: '++id, bookId, order, title, locationId, *characterIds',
      chapters: '++id, bookId, order, title, *characterIds',
      themes: '++id, bookId, name',
      props: '++id, bookId, name',
      writingLogs: '++id, bookId, date, &[bookId+date]'
    });
  }

  // --- CRUD Wrapper Functions (using internal db instance) ---

  // --- Book Operations ---
  async getAllBooks(): Promise<IBook[]> {
    return await this.db.books.orderBy('lastModified').reverse().toArray();
  }
  async addBook(title: string): Promise<number | undefined> {
    try {
      // <-- UPDATE: Add default values for stats
      const newBook: Omit<IBook, 'id'> = { 
        title, 
        createdAt: new Date(), 
        lastModified: new Date(),
        wordCount: 0,
        dailyWordTarget: 500,
        isArchived: false,
        isPinned: false
      };
      const id = await this.db.books.add(newBook as IBook);
      return id;
    } catch (error) {
      console.error("Failed to add book:", error);
      return undefined;
    }
  }
  async updateBookTitle(id: number, title: string): Promise<number> {
    return await this.db.books.update(id, { title, lastModified: new Date() });
  }

  // <-- NEW: Update book stats
  async updateBookStats(id: number, stats: Partial<Pick<IBook, 'wordCount' | 'dailyWordTarget'>>): Promise<number> {
    return await this.db.books.update(id, { ...stats, lastModified: new Date() });
  }

  // <-- NEW: Update book flags (pin/archive)
  async updateBookFlags(id: number, flags: Partial<Pick<IBook, 'isArchived' | 'isPinned'>>): Promise<number> {
    return await this.db.books.update(id, { ...flags, lastModified: new Date() });
  }

  async getBookById(id: number): Promise<IBook | undefined> {
    return await this.db.books.get(id);
  }

  // --- Child Data Operations (Relational) ---
  async getCharactersByBookId(bookId: number): Promise<ICharacter[]> {
    return await this.db.characters.where({ bookId }).toArray();
  }
  async addCharacter(character: Omit<ICharacter, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.characters.add(character as ICharacter);
       return id;
     } catch (error) {
       console.error("Failed to add character:", error);
       return undefined;
     }
  }
  async updateCharacter(id: number, changes: Partial<Omit<ICharacter, 'id' | 'bookId'>>): Promise<number> {
     return await this.db.characters.update(id, changes);
  }
  async deleteCharacter(id: number): Promise<void> {
     await this.db.characters.delete(id);
  }

  // (Add similar async/await wrappers for Location, PlotEvent, Chapter
  //  using this.db.locations..., this.db.plotEvents..., this.db.chapters...)

  async getLocationsByBookId(bookId: number): Promise<ILocation[]> {
    return await this.db.locations.where({ bookId }).toArray();
  }
  async addLocation(location: Omit<ILocation, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.locations.add(location as ILocation);
       return id;
     } catch (error) {
       console.error("Failed to add location:", error);
       return undefined;
     }
  }
  async updateLocation(id: number, changes: Partial<Omit<ILocation, 'id' | 'bookId'>>): Promise<number> {
     return await this.db.locations.update(id, changes);
  }
  async deleteLocation(id: number): Promise<void> {
     await this.db.locations.delete(id);
  }

  async getPlotEventsByBookId(bookId: number): Promise<IPlotEvent[]> {
     return await this.db.plotEvents.where({ bookId }).sortBy('order');
  }
  async addPlotEvent(event: Omit<IPlotEvent, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.plotEvents.add(event as IPlotEvent);
       return id;
     } catch (error) {
       console.error("Failed to add plot event:", error);
       return undefined;
     }
  }
  async updatePlotEvent(id: number, changes: Partial<Omit<IPlotEvent, 'id' | 'bookId'>>): Promise<number> {
     return await this.db.plotEvents.update(id, changes);
  }
  async deletePlotEvent(id: number): Promise<void> {
     await this.db.plotEvents.delete(id);
  }

  async getChaptersByBookId(bookId: number): Promise<IChapter[]> {
     return await this.db.chapters.where({ bookId }).sortBy('order');
  }
  async addChapter(chapter: Omit<IChapter, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.chapters.add(chapter as IChapter);
       return id;
     } catch (error) {
       console.error("Failed to add chapter:", error);
       return undefined;
     }
  }
  async updateChapter(id: number, changes: Partial<Omit<IChapter, 'id' | 'bookId' | 'order'>>): Promise<number> {
     return await this.db.chapters.update(id, changes);
  }
  async deleteChapter(id: number): Promise<void> {
     await this.db.chapters.delete(id);
  }

  // --- Themes Operations ---
  async getThemesByBookId(bookId: number): Promise<ITheme[]> {
    return await this.db.themes.where({ bookId }).toArray();
  }
  async addTheme(theme: Omit<ITheme, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.themes.add(theme as ITheme);
       return id;
     } catch (error) { console.error("Failed to add theme:", error); return undefined; }
  }
  async updateTheme(id: number, changes: Partial<Omit<ITheme, 'id' | 'bookId'>>): Promise<number> {
     return await this.db.themes.update(id, changes);
  }
  async deleteTheme(id: number): Promise<void> {
     await this.db.themes.delete(id);
  }

  // --- Props Operations ---
   async getPropsByBookId(bookId: number): Promise<IProp[]> {
    return await this.db.props.where({ bookId }).toArray();
  }
  async addProp(prop: Omit<IProp, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.props.add(prop as IProp);
       return id;
     } catch (error) { console.error("Failed to add prop:", error); return undefined; }
  }
  async updateProp(id: number, changes: Partial<Omit<IProp, 'id' | 'bookId'>>): Promise<number> {
     return await this.db.props.update(id, changes);
  }
  async deleteProp(id: number): Promise<void> {
     await this.db.props.delete(id);
  }
  
  // --- NEW FUNCTIONS FOR WRITING LOG ---
  async getWritingLogsByBookId(bookId: number): Promise<IWritingLog[]> {
    return await this.db.writingLogs.where({ bookId }).toArray();
  }

  async upsertWritingLog(bookId: number, date: string, wordCountChange: number): Promise<void> {
    const existingLog = await this.db.writingLogs.where({ bookId, date }).first();
    if (existingLog && existingLog.id) {
        const newCount = existingLog.wordCountAdded + wordCountChange;
        await this.db.writingLogs.update(existingLog.id, { wordCountAdded: newCount });
    } else {
        await this.db.writingLogs.add({ bookId, date, wordCountAdded: wordCountChange });
    }
  }

  // <-- NEW FUNCTIONS FOR REORDERING -->

  /** Saves the new order for Plot Events */
  async updatePlotEventOrder(events: IPlotEvent[]): Promise<void> {
    // Use 'bulkPut' to update multiple records in one transaction
    // This is faster and maintains data integrity
    await this.db.plotEvents.bulkPut(events as any); 
  }

  /** Saves the new order for Chapters */
  async updateChapterOrder(chapters: IChapter[]): Promise<void> {
    // Use 'bulkPut' to update multiple records in one transaction
    await this.db.chapters.bulkPut(chapters as any);
  }

  // --- Delete Book and its Children Operations (Transaction) ---
  async deleteBookAndData(bookId: number): Promise<void> {
    try {
      // Access tables via this.db
      // FIX: The transaction method was called with too many arguments.
      // Passing the tables as an array resolves this issue when multiple tables are involved.
      await this.db.transaction('rw', [this.db.books, this.db.characters, this.db.locations, this.db.plotEvents, this.db.chapters, this.db.themes, this.db.props, this.db.writingLogs], async () => {
        await Promise.all([ 
          this.db.characters.where({ bookId }).delete(),
          this.db.locations.where({ bookId }).delete(),
          this.db.plotEvents.where({ bookId }).delete(),
          this.db.chapters.where({ bookId }).delete(),
          this.db.themes.where({ bookId }).delete(),
          this.db.props.where({ bookId }).delete(),
          this.db.writingLogs.where({ bookId }).delete(), // <-- DELETE LOGS
          this.db.books.delete(bookId) 
        ]);
      });
      console.log(`Book ${bookId} and its data were successfully deleted.`);
    } catch (error) {
      console.error(`Failed to delete book ${bookId} and its data:`, error);
      // Maybe re-throw the error so the component can handle it
      throw error; 
    }
  }

  // --- NEW: GLOBAL SEARCH FUNCTION ---
  
  /**
   * Searches all entities across all novels.
   * Uses startsWithIgnoreCase which is very fast thanks to the indexes in v7.
   */
  async searchAllEntities(query: string): Promise<ISearchResult[]> {
    if (query.trim().length === 0) {
      return [];
    }
    
    // 1. Fetch all book titles into a Map for efficiency
    const allBooks = await this.db.books.toArray();
    const bookMap = new Map<number, string>(allBooks.map(b => [b.id!, b.title]));

    // Helper to get book title
    const getBookTitle = (bookId: number) => bookMap.get(bookId) || 'Novel Not Found';

    // 2. Perform all search queries in parallel
    const [
      books, 
      characters, 
      locations, 
      chapters, 
      plotEvents, 
      themes, 
      props
    ] = await Promise.all([
      // Books
      this.db.books.where('title').startsWithIgnoreCase(query).limit(10).toArray(),
      // Characters
      this.db.characters.where('name').startsWithIgnoreCase(query).limit(10).toArray(),
      // Locations
      this.db.locations.where('name').startsWithIgnoreCase(query).limit(10).toArray(),
      // Chapters
      this.db.chapters.where('title').startsWithIgnoreCase(query).limit(10).toArray(),
      // Plot Events
      this.db.plotEvents.where('title').startsWithIgnoreCase(query).limit(10).toArray(),
      // Themes
      this.db.themes.where('name').startsWithIgnoreCase(query).limit(10).toArray(),
      // Props
      this.db.props.where('name').startsWithIgnoreCase(query).limit(10).toArray(),
    ]);

    // 3. Transform results into ISearchResult format
    const results: ISearchResult[] = [
      ...books.map((item): ISearchResult => ({
        type: 'Book',
        name: item.title,
        description: `Novel with ${item.wordCount} words`,
        path: 'Novel',
        bookId: item.id!,
        entityId: item.id!,
      })),
      ...characters.map((item): ISearchResult => ({
        type: 'Character',
        name: item.name,
        description: item.description.substring(0, 50) + '...',
        path: `Novel: ${getBookTitle(item.bookId)}`,
        bookId: item.bookId,
        entityId: item.id!,
      })),
      ...locations.map((item): ISearchResult => ({
        type: 'Location',
        name: item.name,
        description: item.description.substring(0, 50) + '...',
        path: `Novel: ${getBookTitle(item.bookId)}`,
        bookId: item.bookId,
        entityId: item.id!,
      })),
      ...chapters.map((item): ISearchResult => ({
        type: 'Chapter',
        name: item.title,
        description: `Chapter ${item.order}`,
        path: `Novel: ${getBookTitle(item.bookId)}`,
        bookId: item.bookId,
        entityId: item.id!,
      })),
      ...plotEvents.map((item): ISearchResult => ({
        type: 'PlotEvent',
        name: item.title,
        description: item.summary.substring(0, 50) + '...',
        path: `Novel: ${getBookTitle(item.bookId)}`,
        bookId: item.bookId,
        entityId: item.id!,
      })),
      ...themes.map((item): ISearchResult => ({
        type: 'Theme',
        name: item.name,
        description: item.description.substring(0, 50) + '...',
        path: `Novel: ${getBookTitle(item.bookId)}`,
        bookId: item.bookId,
        entityId: item.id!,
      })),
      ...props.map((item): ISearchResult => ({
        type: 'Prop',
        name: item.name,
        description: item.description.substring(0, 50) + '...',
        path: `Novel: ${getBookTitle(item.bookId)}`,
        bookId: item.bookId,
        entityId: item.id!,
      })),
    ];

    // 4. Sort the results (e.g., by name)
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

}