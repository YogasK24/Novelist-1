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

export interface IFullBackupDatabase {
  books: IBook[];
  characters: ICharacter[];
  locations: ILocation[];
  plotEvents: IPlotEvent[];
  chapters: IChapter[];
  themes: ITheme[];
  props: IProp[];
  writingLogs: IWritingLog[];
}

// --- NEW: SCORING CONSTANTS FOR SEARCH RELEVANCE ---
const ENTITY_TYPE_SCORES: Record<SearchResultType, number> = {
  'Book': 20,
  'Chapter': 18,
  'Character': 15,
  'PlotEvent': 12,
  'Location': 10,
  'Theme': 8,
  'Prop': 8,
};
const TITLE_MATCH_BONUS = 5;


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

    // --- NEW: Version 9 -> Add Pin Order Index ---
    this.db.version(9).stores({
      books: '++id, title, lastModified, isArchived, isPinned, pinOrder',
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
    try {
      return await this.db.books.orderBy('lastModified').reverse().toArray();
    } catch (error) {
      console.error("Failed to get all books:", error);
      return [];
    }
  }
  // NEW: Methods for performant batch fetching
  async getAllChapters(): Promise<IChapter[]> {
    try {
      return await this.db.chapters.toArray();
    } catch (error) {
      console.error("Failed to get all chapters:", error);
      return [];
    }
  }
  async getAllCharacters(): Promise<ICharacter[]> {
    try {
      return await this.db.characters.toArray();
    } catch (error) {
      console.error("Failed to get all characters:", error);
      return [];
    }
  }
  async getAllWritingLogs(): Promise<IWritingLog[]> {
    try {
      return await this.db.writingLogs.toArray();
    } catch (error) {
      console.error("Failed to get all writing logs:", error);
      return [];
    }
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
        isPinned: false,
        pinOrder: undefined,
        characterCount: 0,
        chapterCount: 0
      };
      const id = await this.db.books.add(newBook as IBook);
      return id;
    } catch (error) {
      console.error("Failed to add book:", error);
      return undefined;
    }
  }
  async updateBookTitle(id: number, title: string): Promise<number> {
    try {
      return await this.db.books.update(id, { title, lastModified: new Date() });
    } catch (error) {
      console.error("Failed to update book title:", error);
      return 0;
    }
  }

  // <-- NEW: Update book stats
  async updateBookStats(id: number, stats: Partial<Pick<IBook, 'wordCount' | 'dailyWordTarget'>>): Promise<number> {
    try {
      return await this.db.books.update(id, { ...stats, lastModified: new Date() });
    } catch (error) {
      console.error("Failed to update book stats:", error);
      return 0;
    }
  }

  // <-- NEW: Update book flags (pin/archive)
  async updateBookFlags(id: number, flags: Partial<Pick<IBook, 'isArchived' | 'isPinned' | 'pinOrder'>>): Promise<number> {
    try {
      return await this.db.books.update(id, { ...flags, lastModified: new Date() });
    } catch (error) {
      console.error("Failed to update book flags:", error);
      return 0;
    }
  }

  async getBookById(id: number): Promise<IBook | undefined> {
    try {
      return await this.db.books.get(id);
    } catch (error) {
      console.error(`Failed to get book by id ${id}:`, error);
      return undefined;
    }
  }

  // --- Child Data Operations (Relational) ---
  async getCharactersByBookId(bookId: number): Promise<ICharacter[]> {
    try {
      return await this.db.characters.where({ bookId }).toArray();
    } catch (error) {
      console.error(`Failed to get characters for book ${bookId}:`, error);
      return [];
    }
  }
   async getCharacterById(id: number): Promise<ICharacter | undefined> {
    try {
      return await this.db.characters.get(id);
    } catch (error) { console.error(`Failed to get character by id ${id}:`, error); return undefined; }
  }
  async addCharacter(character: Omit<ICharacter, 'id'>): Promise<number | undefined> {
     try {
       let id: number | undefined;
       await this.db.transaction('rw', this.db.characters, this.db.books, async () => {
         id = await this.db.characters.add(character as ICharacter);
         await this.db.books.where({ id: character.bookId }).modify(book => {
           book.characterCount = (book.characterCount || 0) + 1;
           book.lastModified = new Date();
         });
       });
       return id;
     } catch (error) {
       console.error("Failed to add character:", error);
       return undefined;
     }
  }
  async updateCharacter(id: number, changes: Partial<Omit<ICharacter, 'id' | 'bookId'>>): Promise<number> {
     try {
       return await this.db.characters.update(id, changes);
     } catch (error) {
       console.error("Failed to update character:", error);
       return 0;
     }
  }
  async deleteCharacter(id: number): Promise<void> {
    try {
      const character = await this.db.characters.get(id);
      if (!character) return;

      await this.db.transaction('rw', this.db.characters, this.db.books, async () => {
          await this.db.characters.delete(id);
          await this.db.books.where({ id: character.bookId }).modify(book => {
              book.characterCount = Math.max(0, (book.characterCount || 1) - 1);
              book.lastModified = new Date();
          });
      });
    } catch (error) {
      console.error("Failed to delete character:", error);
      throw error; // Re-throw to be handled by the service
    }
  }

  async getLocationsByBookId(bookId: number): Promise<ILocation[]> {
    try {
      return await this.db.locations.where({ bookId }).toArray();
    } catch (error) {
      console.error(`Failed to get locations for book ${bookId}:`, error);
      return [];
    }
  }
  async getLocationById(id: number): Promise<ILocation | undefined> {
    try {
      return await this.db.locations.get(id);
    } catch (error) { console.error(`Failed to get location by id ${id}:`, error); return undefined; }
  }
  async addLocation(location: Omit<ILocation, 'id'>): Promise<number | undefined> {
     try {
       return await this.db.locations.add(location as ILocation);
     } catch (error) {
       console.error("Failed to add location:", error);
       return undefined;
     }
  }
  async updateLocation(id: number, changes: Partial<Omit<ILocation, 'id' | 'bookId'>>): Promise<number> {
     try {
       return await this.db.locations.update(id, changes);
     } catch (error) {
       console.error("Failed to update location:", error);
       return 0;
     }
  }
  async deleteLocation(id: number): Promise<void> {
     try {
       await this.db.locations.delete(id);
     } catch (error) {
       console.error("Failed to delete location:", error);
       throw error;
     }
  }

  async getPlotEventsByBookId(bookId: number): Promise<IPlotEvent[]> {
     try {
       return await this.db.plotEvents.where({ bookId }).sortBy('order');
     } catch (error) {
       console.error(`Failed to get plot events for book ${bookId}:`, error);
       return [];
     }
  }
  async getPlotEventById(id: number): Promise<IPlotEvent | undefined> {
    try {
      return await this.db.plotEvents.get(id);
    } catch (error) { console.error(`Failed to get plot event by id ${id}:`, error); return undefined; }
  }
  async addPlotEvent(event: Omit<IPlotEvent, 'id'>): Promise<number | undefined> {
     try {
       return await this.db.plotEvents.add(event as IPlotEvent);
     } catch (error) {
       console.error("Failed to add plot event:", error);
       return undefined;
     }
  }
  async updatePlotEvent(id: number, changes: Partial<Omit<IPlotEvent, 'id' | 'bookId'>>): Promise<number> {
     try {
       return await this.db.plotEvents.update(id, changes);
     } catch (error) {
       console.error("Failed to update plot event:", error);
       return 0;
     }
  }
  async deletePlotEvent(id: number): Promise<void> {
     try {
       await this.db.plotEvents.delete(id);
     } catch (error) {
       console.error("Failed to delete plot event:", error);
       throw error;
     }
  }

  async getChaptersByBookId(bookId: number): Promise<IChapter[]> {
     try {
       return await this.db.chapters.where({ bookId }).sortBy('order');
     } catch (error) {
       console.error(`Failed to get chapters for book ${bookId}:`, error);
       return [];
     }
  }
  async getChapterById(id: number): Promise<IChapter | undefined> {
    try {
      return await this.db.chapters.get(id);
    } catch (error) { console.error(`Failed to get chapter by id ${id}:`, error); return undefined; }
  }
  async addChapter(chapter: Omit<IChapter, 'id'>): Promise<number | undefined> {
     try {
       let id: number | undefined;
       await this.db.transaction('rw', this.db.chapters, this.db.books, async () => {
         id = await this.db.chapters.add(chapter as IChapter);
         await this.db.books.where({ id: chapter.bookId }).modify(book => {
           book.chapterCount = (book.chapterCount || 0) + 1;
           book.lastModified = new Date();
         });
       });
       return id;
     } catch (error) {
       console.error("Failed to add chapter:", error);
       return undefined;
     }
  }
  async updateChapter(id: number, changes: Partial<Omit<IChapter, 'id' | 'bookId' | 'order'>>): Promise<number> {
     try {
       return await this.db.chapters.update(id, changes);
     } catch (error) {
       console.error("Failed to update chapter:", error);
       return 0;
     }
  }
  async deleteChapter(id: number): Promise<void> {
    try {
      const chapter = await this.db.chapters.get(id);
      if (!chapter) return;

      await this.db.transaction('rw', this.db.chapters, this.db.books, async () => {
          await this.db.chapters.delete(id);
          await this.db.books.where({ id: chapter.bookId }).modify(book => {
              book.chapterCount = Math.max(0, (book.chapterCount || 1) - 1);
              book.lastModified = new Date();
          });
      });
    } catch (error) {
      console.error("Failed to delete chapter:", error);
      throw error;
    }
  }

  // --- Themes Operations ---
  async getThemesByBookId(bookId: number): Promise<ITheme[]> {
    try {
      return await this.db.themes.where({ bookId }).toArray();
    } catch (error) {
      console.error(`Failed to get themes for book ${bookId}:`, error);
      return [];
    }
  }
  async getThemeById(id: number): Promise<ITheme | undefined> {
    try {
      return await this.db.themes.get(id);
    } catch (error) { console.error(`Failed to get theme by id ${id}:`, error); return undefined; }
  }
  async addTheme(theme: Omit<ITheme, 'id'>): Promise<number | undefined> {
     try {
       return await this.db.themes.add(theme as ITheme);
     } catch (error) { console.error("Failed to add theme:", error); return undefined; }
  }
  async updateTheme(id: number, changes: Partial<Omit<ITheme, 'id' | 'bookId'>>): Promise<number> {
     try {
       return await this.db.themes.update(id, changes);
     } catch (error) {
       console.error("Failed to update theme:", error);
       return 0;
     }
  }
  async deleteTheme(id: number): Promise<void> {
     try {
       await this.db.themes.delete(id);
     } catch (error) {
       console.error("Failed to delete theme:", error);
       throw error;
     }
  }

  // --- Props Operations ---
   async getPropsByBookId(bookId: number): Promise<IProp[]> {
    try {
      return await this.db.props.where({ bookId }).toArray();
    } catch (error) {
      console.error(`Failed to get props for book ${bookId}:`, error);
      return [];
    }
  }
  async getPropById(id: number): Promise<IProp | undefined> {
    try {
      return await this.db.props.get(id);
    } catch (error) { console.error(`Failed to get prop by id ${id}:`, error); return undefined; }
  }
  async addProp(prop: Omit<IProp, 'id'>): Promise<number | undefined> {
     try {
       return await this.db.props.add(prop as IProp);
     } catch (error) { console.error("Failed to add prop:", error); return undefined; }
  }
  async updateProp(id: number, changes: Partial<Omit<IProp, 'id' | 'bookId'>>): Promise<number> {
     try {
       return await this.db.props.update(id, changes);
     } catch (error) {
       console.error("Failed to update prop:", error);
       return 0;
     }
  }
  async deleteProp(id: number): Promise<void> {
     try {
       await this.db.props.delete(id);
     } catch (error) {
       console.error("Failed to delete prop:", error);
       throw error;
     }
  }
  
  // --- NEW FUNCTIONS FOR WRITING LOG ---
  async getWritingLogsByBookId(bookId: number): Promise<IWritingLog[]> {
    try {
      return await this.db.writingLogs.where({ bookId }).toArray();
    } catch (error) {
      console.error(`Failed to get writing logs for book ${bookId}:`, error);
      return [];
    }
  }

  async getWritingLogsByDate(date: string): Promise<IWritingLog[]> {
    try {
      return await this.db.writingLogs.where({ date }).toArray();
    } catch (error) {
      console.error(`Failed to get writing logs for date ${date}:`, error);
      return [];
    }
  }

  async upsertWritingLog(bookId: number, date: string, wordCountChange: number): Promise<void> {
    try {
      const existingLog = await this.db.writingLogs.where({ bookId, date }).first();
      if (existingLog && existingLog.id) {
          const newCount = existingLog.wordCountAdded + wordCountChange;
          await this.db.writingLogs.update(existingLog.id, { wordCountAdded: newCount });
      } else {
          await this.db.writingLogs.add({ bookId, date, wordCountAdded: wordCountChange });
      }
    } catch (error) {
      console.error("Failed to upsert writing log:", error);
      throw error;
    }
  }

  // <-- NEW FUNCTIONS FOR REORDERING -->

  /** Saves the new order for Plot Events */
  async updatePlotEventOrder(events: IPlotEvent[]): Promise<void> {
    try {
      await this.db.plotEvents.bulkPut(events as any); 
    } catch (error) {
      console.error("Failed to update plot event order:", error);
      throw error;
    }
  }

  /** Saves the new order for Chapters */
  async updateChapterOrder(chapters: IChapter[]): Promise<void> {
    try {
      await this.db.chapters.bulkPut(chapters as any);
    } catch (error) {
      console.error("Failed to update chapter order:", error);
      throw error;
    }
  }

  /** Saves the new order for Pinned Books */
  async updatePinnedBookOrder(books: IBook[]): Promise<void> {
    try {
      await this.db.books.bulkPut(books as any);
    } catch (error) {
      console.error("Failed to update pinned book order:", error);
      throw error;
    }
  }

  // --- Delete Book and its Children Operations (Transaction) ---
  async deleteBookAndData(bookId: number): Promise<void> {
    try {
      await this.db.transaction('rw', [this.db.books, this.db.characters, this.db.locations, this.db.plotEvents, this.db.chapters, this.db.themes, this.db.props, this.db.writingLogs], async () => {
        await Promise.all([ 
          this.db.characters.where({ bookId }).delete(),
          this.db.locations.where({ bookId }).delete(),
          this.db.plotEvents.where({ bookId }).delete(),
          this.db.chapters.where({ bookId }).delete(),
          this.db.themes.where({ bookId }).delete(),
          this.db.props.where({ bookId }).delete(),
          this.db.writingLogs.where({ bookId }).delete(),
          this.db.books.delete(bookId) 
        ]);
      });
      console.log(`Book ${bookId} and its data were successfully deleted.`);
    } catch (error) {
      console.error(`Failed to delete book ${bookId} and its data:`, error);
      throw error; 
    }
  }

  // --- NEW: GLOBAL SEARCH FUNCTION ---
  
  /**
   * Searches all entities and sorts them by relevance.
   * Relevance is determined by entity type and where the match occurs (title vs. description).
   */
  async searchAllEntities(query: string): Promise<ISearchResult[]> {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return [];
    }

    try {
      // Pre-fetch all books to create a map for efficient title lookup.
      const allBooks = await this.db.books.toArray();
      const bookMap = new Map<number, string>(allBooks.map(b => [b.id!, b.title]));
      const getBookTitle = (bookId: number) => bookMap.get(bookId) || 'Novel Not Found';

      // Fetch all candidate entities in parallel using performant, indexed `startsWithIgnoreCase` queries.
      const [
        books, 
        characters, 
        locations, 
        chapters, 
        plotEvents, 
        themes, 
        props
      ] = await Promise.all([
        this.db.books.where('title').startsWithIgnoreCase(trimmedQuery).limit(10).toArray(),
        this.db.characters.where('name').startsWithIgnoreCase(trimmedQuery).limit(10).toArray(),
        this.db.locations.where('name').startsWithIgnoreCase(trimmedQuery).limit(10).toArray(),
        this.db.chapters.where('title').startsWithIgnoreCase(trimmedQuery).limit(10).toArray(),
        this.db.plotEvents.where('title').startsWithIgnoreCase(trimmedQuery).limit(10).toArray(),
        this.db.themes.where('name').startsWithIgnoreCase(trimmedQuery).limit(10).toArray(),
        this.db.props.where('name').startsWithIgnoreCase(trimmedQuery).limit(10).toArray(),
      ]);

      const scoredResults: (ISearchResult & { score: number })[] = [];

      // Process and score each entity type.
      // Since we only get title/name matches now, we can apply the bonus universally.
      books.forEach(item => {
        scoredResults.push({
          type: 'Book', name: item.title, description: `Novel with ${item.wordCount} words`, path: 'Novel', bookId: item.id!, entityId: item.id!,
          score: ENTITY_TYPE_SCORES['Book'] + TITLE_MATCH_BONUS
        });
      });
      
      characters.forEach(item => {
        scoredResults.push({
          type: 'Character', name: item.name, description: item.description.substring(0, 50) + '...', path: `Novel: ${getBookTitle(item.bookId)}`, bookId: item.bookId, entityId: item.id!,
          score: ENTITY_TYPE_SCORES['Character'] + TITLE_MATCH_BONUS
        });
      });

      locations.forEach(item => {
        scoredResults.push({
          type: 'Location', name: item.name, description: item.description.substring(0, 50) + '...', path: `Novel: ${getBookTitle(item.bookId)}`, bookId: item.bookId, entityId: item.id!,
          score: ENTITY_TYPE_SCORES['Location'] + TITLE_MATCH_BONUS
        });
      });

      chapters.forEach(item => {
        scoredResults.push({
          type: 'Chapter', name: item.title, description: `Chapter ${item.order}`, path: `Novel: ${getBookTitle(item.bookId)}`, bookId: item.bookId, entityId: item.id!,
          score: ENTITY_TYPE_SCORES['Chapter'] + TITLE_MATCH_BONUS
        });
      });

      plotEvents.forEach(item => {
        scoredResults.push({
          type: 'PlotEvent', name: item.title, description: item.summary.substring(0, 50) + '...', path: `Novel: ${getBookTitle(item.bookId)}`, bookId: item.bookId, entityId: item.id!,
          score: ENTITY_TYPE_SCORES['PlotEvent'] + TITLE_MATCH_BONUS
        });
      });

      themes.forEach(item => {
        scoredResults.push({
          type: 'Theme', name: item.name, description: item.description.substring(0, 50) + '...', path: `Novel: ${getBookTitle(item.bookId)}`, bookId: item.bookId, entityId: item.id!,
          score: ENTITY_TYPE_SCORES['Theme'] + TITLE_MATCH_BONUS
        });
      });

      props.forEach(item => {
        scoredResults.push({
          type: 'Prop', name: item.name, description: item.description.substring(0, 50) + '...', path: `Novel: ${getBookTitle(item.bookId)}`, bookId: item.bookId, entityId: item.id!,
          score: ENTITY_TYPE_SCORES['Prop'] + TITLE_MATCH_BONUS
        });
      });

      // Sort results: primary by score (desc), secondary by name (asc).
      return scoredResults.sort((a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score;
        }
        return a.name.localeCompare(b.name);
      });

    } catch (error) {
      console.error("Failed to search entities:", error);
      return [];
    }
  }


  // --- NEW: DATA BACKUP/RESTORE METHODS ---
  async exportAllData(): Promise<IFullBackupDatabase> {
    try {
      const [ books, characters, locations, plotEvents, chapters, themes, props, writingLogs ] = await Promise.all([
        this.db.books.toArray(), this.db.characters.toArray(), this.db.locations.toArray(), this.db.plotEvents.toArray(), this.db.chapters.toArray(), this.db.themes.toArray(), this.db.props.toArray(), this.db.writingLogs.toArray(),
      ]);
      return { books, characters, locations, plotEvents, chapters, themes, props, writingLogs };
    } catch (error) {
      console.error("Failed to export all data:", error);
      throw error;
    }
  }

  async importAllData(data: IFullBackupDatabase): Promise<void> {
    try {
      await this.db.transaction('rw', this.db.tables, async () => {
        await Promise.all(this.db.tables.map(table => table.clear()));
        await Promise.all([
          this.db.books.bulkAdd(data.books), this.db.characters.bulkAdd(data.characters), this.db.locations.bulkAdd(data.locations), this.db.plotEvents.bulkAdd(data.plotEvents), this.db.chapters.bulkAdd(data.chapters), this.db.themes.bulkAdd(data.themes), this.db.props.bulkAdd(data.props), this.db.writingLogs.bulkAdd(data.writingLogs),
        ]);
      });
    } catch (error) {
      console.error("Failed to import all data:", error);
      throw error;
    }
  }
}