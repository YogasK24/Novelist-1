// src/app/state/confirmation.service.ts
import { Injectable, signal } from '@angular/core';

// Definisikan data yang kita butuhkan untuk konfirmasi
export interface ConfirmationRequest {
  message: string; // Pesan yang akan ditampilkan (cth: "Yakin ingin hapus 'Andra'?")
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm: () => void; // Fungsi yang akan dijalankan JIKA user klik "Confirm"
  onCancel: () => void;  // Fungsi yang akan dijalankan JIKA user klik "Cancel"
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  
  // Ini adalah state globalnya!
  readonly request = signal<ConfirmationRequest | null>(null);
  private elementToRestoreFocus: HTMLElement | null = null;

  /**
   * Dipanggil oleh komponen (cth: character-list) untuk MEMINTA konfirmasi.
   */
  requestConfirmation(options: Partial<ConfirmationRequest> & { message: string; onConfirm: () => void; }): void {
    this.elementToRestoreFocus = document.activeElement as HTMLElement;
    const defaults = {
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      onCancel: () => this.closeConfirmation(), // Default cancel hanya menutup modal
      ...options
    };
    this.request.set(defaults as ConfirmationRequest);
  }

  /**
   * Dipanggil oleh modal untuk MENUTUP konfirmasi.
   */
  closeConfirmation(): void {
    this.request.set(null);
    setTimeout(() => {
      this.elementToRestoreFocus?.focus?.();
      this.elementToRestoreFocus = null;
    }, 300);
  }
}
