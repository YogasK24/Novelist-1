// src/app/state/database.service.ts

import { Injectable } from '@angular/core'; // Import Injectable decorator
import Dexie, { type Table } from 'dexie';
// Pastikan path impor ini benar
import type { IBook, ICharacter, ILocation, IPlotEvent, IChapter, ITheme, IProp, IRelationship, IWritingLog, ISearchResult, SearchResultType } from '../../types/data'; // <-- Tambah ISearchResult

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
  writingLogs: Table<IWritingLog, number>; // <-- BARU
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
    
    // --- BARU: Versi 7 -> Tambahkan Indeks Pencarian ---
    this.db.version(7).stores({
      books: '++id, title, lastModified',
      characters: '++id, bookId, name, *relationships.targetId',
      locations: '++id, bookId, name',
      plotEvents: '++id, bookId, order, title, locationId, *characterIds', // <-- Tambah 'title'
      chapters: '++id, bookId, order, title, *characterIds', // <-- Tambah 'title'
      themes: '++id, bookId, name',
      props: '++id, bookId, name',
      writingLogs: '++id, bookId, date, &[bookId+date]'
    });
  }

  // --- Wrapper Fungsi CRUD (menggunakan instance db internal) ---

  // --- Operasi Buku (Books) ---
  async getAllBooks(): Promise<IBook[]> {
    return await this.db.books.orderBy('lastModified').reverse().toArray();
  }
  async addBook(title: string): Promise<number | undefined> {
    try {
      // <-- UPDATE: Tambahkan nilai default untuk statistik
      const newBook: Omit<IBook, 'id'> = { 
        title, 
        createdAt: new Date(), 
        lastModified: new Date(),
        wordCount: 0,
        dailyWordTarget: 500 
      };
      const id = await this.db.books.add(newBook as IBook);
      return id;
    } catch (error) {
      console.error("Gagal menambah buku:", error);
      return undefined;
    }
  }
  async updateBookTitle(id: number, title: string): Promise<number> {
    return await this.db.books.update(id, { title, lastModified: new Date() });
  }

  // <-- BARU: Update statistik buku
  async updateBookStats(id: number, stats: Partial<Pick<IBook, 'wordCount' | 'dailyWordTarget'>>): Promise<number> {
    return await this.db.books.update(id, { ...stats, lastModified: new Date() });
  }

  async getBookById(id: number): Promise<IBook | undefined> {
    return await this.db.books.get(id);
  }

  // --- Operasi Data Anak (Relasional) ---
  async getCharactersByBookId(bookId: number): Promise<ICharacter[]> {
    return await this.db.characters.where({ bookId }).toArray();
  }
  async addCharacter(character: Omit<ICharacter, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.characters.add(character as ICharacter);
       return id;
     } catch (error) {
       console.error("Gagal menambah karakter:", error);
       return undefined;
     }
  }
  async updateCharacter(id: number, changes: Partial<Omit<ICharacter, 'id' | 'bookId'>>): Promise<number> {
     return await this.db.characters.update(id, changes);
  }
  async deleteCharacter(id: number): Promise<void> {
     await this.db.characters.delete(id);
  }

  // (Tambahkan wrapper async/await serupa untuk Location, PlotEvent, Chapter
  //  menggunakan this.db.locations..., this.db.plotEvents..., this.db.chapters...)

  async getLocationsByBookId(bookId: number): Promise<ILocation[]> {
    return await this.db.locations.where({ bookId }).toArray();
  }
  async addLocation(location: Omit<ILocation, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.locations.add(location as ILocation);
       return id;
     } catch (error) {
       console.error("Gagal menambah lokasi:", error);
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
       console.error("Gagal menambah event plot:", error);
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
       console.error("Gagal menambah bab:", error);
       return undefined;
     }
  }
  async updateChapter(id: number, changes: Partial<Omit<IChapter, 'id' | 'bookId' | 'order'>>): Promise<number> {
     return await this.db.chapters.update(id, changes);
  }
  async deleteChapter(id: number): Promise<void> {
     await this.db.chapters.delete(id);
  }

  // --- Operasi Themes ---
  async getThemesByBookId(bookId: number): Promise<ITheme[]> {
    return await this.db.themes.where({ bookId }).toArray();
  }
  async addTheme(theme: Omit<ITheme, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.themes.add(theme as ITheme);
       return id;
     } catch (error) { console.error("Gagal menambah theme:", error); return undefined; }
  }
  async updateTheme(id: number, changes: Partial<Omit<ITheme, 'id' | 'bookId'>>): Promise<number> {
     return await this.db.themes.update(id, changes);
  }
  async deleteTheme(id: number): Promise<void> {
     await this.db.themes.delete(id);
  }

  // --- Operasi Props ---
   async getPropsByBookId(bookId: number): Promise<IProp[]> {
    return await this.db.props.where({ bookId }).toArray();
  }
  async addProp(prop: Omit<IProp, 'id'>): Promise<number | undefined> {
     try {
       const id = await this.db.props.add(prop as IProp);
       return id;
     } catch (error) { console.error("Gagal menambah prop:", error); return undefined; }
  }
  async updateProp(id: number, changes: Partial<Omit<IProp, 'id' | 'bookId'>>): Promise<number> {
     return await this.db.props.update(id, changes);
  }
  async deleteProp(id: number): Promise<void> {
     await this.db.props.delete(id);
  }
  
  // --- FUNGSI BARU UNTUK LOG PENULISAN ---
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

  // <-- FUNGSI BARU UNTUK REORDERING -->

  /** Menyimpan urutan baru untuk Plot Event */
  async updatePlotEventOrder(events: IPlotEvent[]): Promise<void> {
    // Gunakan 'bulkPut' untuk update beberapa record dalam satu transaction
    // Ini lebih cepat dan menjaga integritas data
    await this.db.plotEvents.bulkPut(events as any); 
  }

  /** Menyimpan urutan baru untuk Chapters */
  async updateChapterOrder(chapters: IChapter[]): Promise<void> {
    // Gunakan 'bulkPut' untuk update beberapa record dalam satu transaction
    await this.db.chapters.bulkPut(chapters as any);
  }

  // --- Operasi Hapus Buku Beserta Anaknya (Transaction) ---
  async deleteBookAndData(bookId: number): Promise<void> {
    try {
      // Akses tabel via this.db
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
          this.db.writingLogs.where({ bookId }).delete(), // <-- HAPUS LOG
          this.db.books.delete(bookId) 
        ]);
      });
      console.log(`Buku ${bookId} dan datanya berhasil dihapus.`);
    } catch (error) {
      console.error(`Gagal menghapus buku ${bookId} dan datanya:`, error);
      // Mungkin lempar error lagi agar komponen bisa menangani
      throw error; 
    }
  }

  // --- BARU: FUNGSI PENCARIAN GLOBAL ---
  
  /**
   * Mencari di semua entitas di semua novel.
   * Menggunakan startsWithIgnoreCase yang sangat cepat berkat indeks di v7.
   */
  async searchAllEntities(query: string): Promise<ISearchResult[]> {
    if (query.trim().length === 0) {
      return [];
    }
    
    // 1. Ambil semua judul buku ke dalam Map untuk efisiensi
    const allBooks = await this.db.books.toArray();
    const bookMap = new Map<number, string>(allBooks.map(b => [b.id!, b.title]));

    // Helper untuk mengambil judul buku
    const getBookTitle = (bookId: number) => bookMap.get(bookId) || 'Novel Tidak Ditemukan';

    // 2. Lakukan semua kueri pencarian secara paralel
    const [
      books, 
      characters, 
      locations, 
      chapters, 
      plotEvents, 
      themes, 
      props
    ] = await Promise.all([
      // Buku
      this.db.books.where('title').startsWithIgnoreCase(query).limit(10).toArray(),
      // Karakter
      this.db.characters.where('name').startsWithIgnoreCase(query).limit(10).toArray(),
      // Lokasi
      this.db.locations.where('name').startsWithIgnoreCase(query).limit(10).toArray(),
      // Bab
      this.db.chapters.where('title').startsWithIgnoreCase(query).limit(10).toArray(),
      // Plot Events
      this.db.plotEvents.where('title').startsWithIgnoreCase(query).limit(10).toArray(),
      // Tema
      this.db.themes.where('name').startsWithIgnoreCase(query).limit(10).toArray(),
      // Properti
      this.db.props.where('name').startsWithIgnoreCase(query).limit(10).toArray(),
    ]);

    // 3. Ubah hasil menjadi format ISearchResult
    const results: ISearchResult[] = [
      ...books.map((item): ISearchResult => ({
        type: 'Book',
        name: item.title,
        description: `Novel dengan ${item.wordCount} kata`,
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
        description: `Bab ${item.order}`,
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

    // 4. Urutkan hasil (misalnya berdasarkan nama)
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

}