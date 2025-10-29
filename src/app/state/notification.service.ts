// src/app/state/notification.service.ts

import { Injectable, signal, effect, WritableSignal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface INotification {
  id: number;
  message: string;
  type: NotificationType;
  duration?: number; // Durasi tampil dalam ms
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private nextId = 0;
  private readonly TIMEOUT = 3000; // Default 3 detik

  // Signal yang menampung daftar notifikasi aktif
  readonly notifications: WritableSignal<INotification[]> = signal([]);

  constructor() {
    // Effect untuk secara otomatis menghapus notifikasi setelah durasi
    effect((onCleanup) => {
      const activeNotifications = this.notifications();
      if (activeNotifications.length > 0) {
        // Hanya fokus pada notifikasi yang paling lama (paling atas)
        const oldestNotification = activeNotifications[0];
        const duration = oldestNotification.duration ?? this.TIMEOUT;

        const timer = setTimeout(() => {
          this.removeNotification(oldestNotification.id);
        }, duration);

        // Cleanup: Hapus timer jika sinyal berubah sebelum timeout
        onCleanup(() => clearTimeout(timer));
      }
    });
  }

  /**
   * Menambahkan notifikasi baru ke dalam daftar.
   */
  private addNotification(message: string, type: NotificationType, duration?: number): void {
    const newNotification: INotification = {
      id: this.nextId++,
      message,
      type,
      duration
    };
    this.notifications.update(n => [...n, newNotification]);
  }

  /**
   * Menghapus notifikasi berdasarkan ID.
   */
  removeNotification(id: number): void {
    this.notifications.update(n => n.filter(notif => notif.id !== id));
  }

  // --- Metode Publik untuk Komponen/Service Lain ---

  success(message: string, duration?: number): void {
    this.addNotification(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    // Notifikasi error bisa bertahan lebih lama
    this.addNotification(message, 'error', duration ?? 5000); 
  }

  info(message: string, duration?: number): void {
    this.addNotification(message, 'info', duration);
  }
}