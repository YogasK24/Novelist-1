// src/types/data.ts
// (Sama seperti sebelumnya)

export interface IBook {
  id?: number; 
  title: string;
  createdAt: Date;
  lastModified: Date;
}

export interface ICharacter {
  id?: number; 
  bookId: number; 
  name: string;
  description: string;
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
}

export interface IChapter {
  id?: number; 
  bookId: number; 
  title: string;
  content: string; 
  order: number; 
}
