// src/types/data.ts
// (Sama seperti sebelumnya)

export interface IBook {
  id?: number; 
  title: string;
  createdAt: Date;
  lastModified: Date;
  wordCount: number;         // <-- NEW: Total word count in this book
  dailyWordTarget: number;   // <-- NEW: Daily word target (e.g., 500)
  isArchived?: boolean;      // <-- NEW: To hide book from main view
  isPinned?: boolean;        // <-- NEW: To keep book at the top
  pinOrder?: number;         // <-- NEW: For custom ordering of pinned books
  chapterCount: number;      // <-- NEW (Denormalized)
  characterCount: number;    // <-- NEW (Denormalized)
}

// --- TAMBAHKAN INTERFACE BARU DI SINI ---
// (Ini adalah tipe yang kita pindahkan)
export interface IBookWithStats extends IBook {
  dailyProgressPercentage?: number;
}
// --- AKHIR TAMBAHAN ---

export interface IRelationship { // <-- NEW: Relationship Interface
  targetId: number; // ID of the other Character
  type: string;     // Type of relationship, e.g., 'Rival', 'Ally', 'Family'
}

export interface ICharacter {
  id?: number; 
  bookId: number; 
  name: string;
  description: string;
  relationships: IRelationship[]; // <-- NEW: List of relationships
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
  locationId: number | null; // <-- NEW: Many-to-One relationship to Location
  characterIds: number[];    // <-- NEW: Many-to-Many relationship to Character
}

export interface IChapter {
  id?: number; 
  bookId: number; 
  title: string;
  content: string; 
  order: number; 
  characterIds: number[]; // <-- NEW: Many-to-Many relationship to Character
}

export interface ITheme {
  id?: number; 
  bookId: number; 
  name: string; // Theme name, e.g., "Courage", "Betrayal"
  description: string; // Short description
}

export interface IProp { // Prop can mean an important item in the story
  id?: number; 
  bookId: number; 
  name: string; // Prop name, e.g., "Legendary Sword", "Last Will"
  description: string; // Description/notes about the prop
}

export interface IWritingLog { // <-- NEW: Daily Log
  id?: number;
  bookId: number;
  date: string;              // YYYY-MM-DD Format
  wordCountAdded: number;    // Number of words added that day
}

// --- NEW: Data Types for Global Search ---

export type SearchResultType = 'Book' | 'Character' | 'Location' | 'Chapter' | 'PlotEvent' | 'Theme' | 'Prop';

export interface ISearchResult {
  type: SearchResultType;
  name: string;         // Matching name/title (e.g., "Andra" or "Chapter 1: The Beginning")
  description: string;  // Description/summary snippet
  path: string;         // Context (e.g., "Novel: The Dragon's Lair")
  bookId: number;
  entityId: number;     // ID of the item itself (e.g., character.id or chapter.id)
}