// src/app/state/help-content.service.ts
import { Injectable, signal } from '@angular/core';

export interface HelpTip {
  icon: string;
  title: string;
  description: string;
}

export interface HelpSection {
  title: string;
  isList: boolean;
  content: (string | HelpTip)[]; 
}

// Tipe untuk mendefinisikan konten bantuan berdasarkan konteks
type ContextualHelpContent = Record<string, HelpSection[]>;

@Injectable({
  providedIn: 'root'
})
export class HelpContentService {
    private readonly _content = signal<ContextualHelpContent | null>(null);
    public readonly content = this._content.asReadonly();
    public readonly isLoading = signal<boolean>(true);
    public readonly error = signal<string | null>(null);

    constructor() {
      this.loadContent();
    }
    
    private async loadContent(): Promise<void> {
      this.isLoading.set(true);
      this.error.set(null);
      try {
        const response = await fetch('src/assets/help-content.json');
        if (!response.ok) {
          throw new Error(`Gagal memuat data: ${response.statusText}`);
        }
        const data: ContextualHelpContent = await response.json();
        this._content.set(data);
      } catch (e: unknown) {
        console.error('Gagal memuat konten bantuan:', e);
        this.error.set('Gagal memuat konten bantuan. Silakan coba lagi nanti.');
      } finally {
        this.isLoading.set(false);
      }
    }
}