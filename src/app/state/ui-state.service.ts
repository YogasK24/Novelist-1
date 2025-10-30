// src/app/state/ui-state.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  
  /**
   * Melacak ID unik dari menu yang sedang terbuka.
   * Kita bisa menggunakan string atau number. Kita akan gunakan 'header' atau bookId.
   */
  readonly activeMenuId = signal<string | number | null>(null);

  /**
   * Buka/tutup menu. Jika ID yang sama diklik, tutup. Jika ID berbeda, buka yang baru.
   */
  toggleMenu(id: string | number): void {
    this.activeMenuId.update(currentId => {
      return currentId === id ? null : id; // Jika sama -> tutup, jika beda -> buka
    });
  }

  /**
   * Tutup semua menu yang mungkin terbuka.
   */
  closeAllMenus(): void {
    this.activeMenuId.set(null);
  }
}
