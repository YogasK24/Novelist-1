// src/app/state/book-data-sync.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import type { IBook } from '../../types/data';

/**
 * Service ini berfungsi sebagai event bus untuk menyinkronkan perubahan data buku
 * di antara berbagai service state tanpa menciptakan ketergantungan langsung (tight coupling).
 * Ini menggunakan pola publish-subscribe.
 */
@Injectable({
  providedIn: 'root'
})
export class BookDataSyncService {

  // Subject untuk pembaruan statistik buku (misalnya, jumlah kata)
  private bookStatsUpdatedSource = new Subject<{ bookId: number; stats: Partial<Pick<IBook, 'wordCount' | 'dailyWordTarget'>> }>();
  
  // Subject untuk perubahan jumlah entitas anak (bab/karakter)
  private bookCountChangedSource = new Subject<{ bookId: number; countType: 'chapterCount' | 'characterCount'; change: 1 | -1 }>();

  /**
   * Observable yang dapat di-subscribe oleh service lain untuk mendengarkan pembaruan statistik buku.
   */
  readonly bookStatsUpdated$ = this.bookStatsUpdatedSource.asObservable();
  
  /**
   * Observable yang dapat di-subscribe oleh service lain untuk mendengarkan perubahan jumlah.
   */
  readonly bookCountChanged$ = this.bookCountChangedSource.asObservable();

  /**
   * Dipanggil oleh service yang melakukan perubahan untuk menyiarkan pembaruan statistik.
   */
  notifyStatsUpdate(bookId: number, stats: Partial<Pick<IBook, 'wordCount' | 'dailyWordTarget'>>): void {
    this.bookStatsUpdatedSource.next({ bookId, stats });
  }

  /**
   * Dipanggil oleh service yang melakukan perubahan untuk menyiarkan perubahan jumlah.
   */
  notifyCountChange(bookId: number, countType: 'chapterCount' | 'characterCount', change: 1 | -1): void {
    this.bookCountChangedSource.next({ bookId, countType, change });
  }
}
