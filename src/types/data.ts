// src/types/data.ts
// (Sama seperti sebelumnya)

export interface IBook {
  id?: number; 
  title: string;
  createdAt: Date;
  lastModified: Date;
  wordCount: number;         // <-- BARU: Total jumlah kata di buku ini
  dailyWordTarget: number;   // <-- BARU: Target kata per hari (misal: 500)
}

export interface IRelationship { // <-- BARU: Interface Relasi
  targetId: number; // ID Karakter lain
  type: string;     // Jenis hubungan, misal: 'Rival', 'Ally', 'Family'
}

export interface ICharacter {
  id?: number; 
  bookId: number; 
  name: string;
  description: string;
  relationships: IRelationship[]; // <-- BARU: Daftar hubungan
}

export interface ILocation {
  id?: number; 
  bookId: number; 
  name: string;
  description: string;
}

export interface IPlotEvent {
  id?: number; 
  bookId: number; 
  title: string;
  summary: string;
  order: number; 
  locationId: number | null; // <-- BARU: Hubungan Many-to-One ke Lokasi
  characterIds: number[];    // <-- BARU: Hubungan Many-to-Many ke Karakter
}

export interface IChapter {
  id?: number; 
  bookId: number; 
  title: string;
  content: string; 
  order: number; 
  characterIds: number[]; // <-- BARU: Hubungan Many-to-Many ke Karakter
}

export interface ITheme {
  id?: number; 
  bookId: number; 
  name: string; // Nama tema, misal: "Keberanian", "Pengkhianatan"
  description: string; // Deskripsi singkat
}

export interface IProp { // Prop bisa berarti item penting dalam cerita
  id?: number; 
  bookId: number; 
  name: string; // Nama prop, misal: "Pedang Legendaris", "Surat Wasiat"
  description: string; // Deskripsi/catatan tentang prop
}

export interface IWritingLog { // <-- BARU: Log harian
  id?: number;
  bookId: number;
  date: string;              // Format YYYY-MM-DD
  wordCountAdded: number;    // Jumlah kata yang ditambahkan hari itu
}
