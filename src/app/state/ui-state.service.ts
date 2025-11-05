// src/app/state/ui-state.service.ts
import { Injectable, signal } from '@angular/core';
import type { IBook } from '../../types/data';

export const HEADER_OPTIONS_MENU_ID = 'headerOptions';
export const DASHBOARD_FILTER_MENU_ID = 'dashboardFilter';
export const HEADER_ANIMATION_DURATION = 500; // Dalam ms, cocok dengan durasi CSS

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  
  // --- Menu State ---
  readonly activeMenuId = signal<string | number | null>(null);

  // --- Header State ---
  readonly headerState = signal<'default' | 'searchActive'>('default');
  readonly isHeaderAnimating = signal(false);

  // --- Modal State (Moved from DashboardComponent) ---
  readonly isAddEditBookModalOpen = signal(false);
  readonly editingBook = signal<IBook | null>(null);

  readonly isSetTargetModalOpen = signal(false);
  readonly bookForTarget = signal<IBook | null>(null);

  readonly isHelpModalOpen = signal(false);

  // --- 1. STATE BARU UNTUK MODAL STATISTIK ---
  readonly isStatisticsModalOpen = signal(false);

  // --- Select Mode State ---
  readonly isSelectMode = signal(false);

  // --- NEW: Focus Management ---
  private elementToRestoreFocus: HTMLElement | null = null;

  private _storeFocus(): void {
    this.elementToRestoreFocus = document.activeElement as HTMLElement;
  }

  private _restoreFocus(): void {
    this.elementToRestoreFocus?.focus?.();
    this.elementToRestoreFocus = null;
  }

  // --- Menu Methods ---
  toggleMenu(id: string | number): void {
    if (this.isHeaderAnimating()) return;

    const isOpening = this.activeMenuId() !== id;
    
    if (isOpening) {
        this.activeMenuId.set(null); // Tutup menu yang sedang aktif

        if (this.headerState() === 'searchActive') {
            this.deactivateHeaderSearch(); // Tutup pencarian terlebih dahulu
            // Kemudian buka menu setelah animasi pencarian selesai
            setTimeout(() => {
                this.activeMenuId.set(id);
            }, HEADER_ANIMATION_DURATION);
        } else {
            // Jika pencarian tidak aktif, buka menu secara langsung
            this.activeMenuId.set(id);
        }
    } else {
        // Jika hanya menutup menu
        this.activeMenuId.set(null);
    }
  }

  closeMenu(id: string | number): void {
    this.activeMenuId.update(currentId => {
      return currentId === id ? null : currentId;
    });
  }

  closeAllMenus(): void {
    this.activeMenuId.set(null);
  }
  
  // --- Header Methods ---
  activateHeaderSearch(): void {
    if (this.isHeaderAnimating() || this.headerState() === 'searchActive') return;

    this.closeAllMenus(); // Tutup menu sebelum menampilkan pencarian

    this.isHeaderAnimating.set(true);
    this.headerState.set('searchActive');
    setTimeout(() => this.isHeaderAnimating.set(false), HEADER_ANIMATION_DURATION);
  }
  
  deactivateHeaderSearch(): void {
    if (this.isHeaderAnimating() || this.headerState() === 'default') return;

    this.isHeaderAnimating.set(true);
    this.headerState.set('default');
    setTimeout(() => this.isHeaderAnimating.set(false), HEADER_ANIMATION_DURATION);
  }
  
  toggleHeaderSearch(): void {
    if (this.isHeaderAnimating()) return;

    if (this.headerState() === 'default') {
        this.activateHeaderSearch();
    } else {
        this.deactivateHeaderSearch();
    }
  }

  // --- Select Mode Methods ---
  
  /**
   * Mengaktifkan mode pemilihan massal.
   */
  enterSelectMode(): void {
    this.isSelectMode.set(true);
    this.closeAllMenus(); // Tutup menu lain saat masuk mode ini
  }

  /**
   * Keluar dari mode pemilihan massal.
   */
  exitSelectMode(): void {
    this.isSelectMode.set(false);
    // Logika untuk membersihkan item terpilih akan ditangani di BookStateService
  }

  // --- Modal Methods ---
  openAddBookModal(): void {
    this._storeFocus();
    this.closeAllMenus();
    this.editingBook.set(null);
    this.isAddEditBookModalOpen.set(true);
  }

  openEditBookModal(book: IBook): void {
    this._storeFocus();
    this.closeAllMenus();
    this.editingBook.set(book);
    this.isAddEditBookModalOpen.set(true);
  }

  closeBookModal(): void {
    this.isAddEditBookModalOpen.set(false);
    // Wait for animation before clearing data and restoring focus
    setTimeout(() => {
      this.editingBook.set(null);
      this._restoreFocus();
    }, 300); 
  }

  openSetTargetModal(book: IBook): void {
    this._storeFocus();
    this.closeAllMenus();
    this.bookForTarget.set(book);
    this.isSetTargetModalOpen.set(true);
  }

  closeSetTargetModal(): void {
    this.isSetTargetModalOpen.set(false);
    // Wait for animation before clearing data and restoring focus
    setTimeout(() => {
      this.bookForTarget.set(null);
      this._restoreFocus();
    }, 300);
  }

  openHelpModal(): void {
    this._storeFocus();
    this.closeAllMenus();
    this.isHelpModalOpen.set(true);
  }

  closeHelpModal(): void {
    this.isHelpModalOpen.set(false);
    // Wait for animation before restoring focus
    setTimeout(() => this._restoreFocus(), 300);
  }

  // --- 2. FUNGSI BARU UNTUK KONTROL MODAL ---
  openStatisticsModal(): void {
    this._storeFocus();
    this.closeAllMenus(); // Tutup menu lain
    this.isStatisticsModalOpen.set(true);
  }

  closeStatisticsModal(): void {
    this.isStatisticsModalOpen.set(false);
     // Wait for animation before restoring focus
    setTimeout(() => this._restoreFocus(), 300);
  }
}
