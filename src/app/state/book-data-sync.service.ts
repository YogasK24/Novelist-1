// src/app/state/book-data-sync.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import type { IBook, ICharacter, ILocation, IPlotEvent, IChapter, ITheme, IProp } from '../../types/data';

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

  // --- NEW: Character Sync ---
  private readonly characterAddedSource = new Subject<ICharacter>();
  readonly characterAdded$ = this.characterAddedSource.asObservable();
  notifyCharacterAdded(character: ICharacter) { this.characterAddedSource.next(character); }

  private readonly characterUpdatedSource = new Subject<ICharacter>();
  readonly characterUpdated$ = this.characterUpdatedSource.asObservable();
  notifyCharacterUpdate(character: ICharacter) { this.characterUpdatedSource.next(character); }

  private readonly characterDeletedSource = new Subject<number>();
  readonly characterDeleted$ = this.characterDeletedSource.asObservable();
  notifyCharacterDeleted(id: number) { this.characterDeletedSource.next(id); }

  // --- NEW: Location Sync ---
  private readonly locationAddedSource = new Subject<ILocation>();
  readonly locationAdded$ = this.locationAddedSource.asObservable();
  notifyLocationAdded(location: ILocation) { this.locationAddedSource.next(location); }

  private readonly locationUpdatedSource = new Subject<ILocation>();
  readonly locationUpdated$ = this.locationUpdatedSource.asObservable();
  notifyLocationUpdate(location: ILocation) { this.locationUpdatedSource.next(location); }

  private readonly locationDeletedSource = new Subject<number>();
  readonly locationDeleted$ = this.locationDeletedSource.asObservable();
  notifyLocationDeleted(id: number) { this.locationDeletedSource.next(id); }

  // --- NEW: PlotEvent Sync ---
  private readonly plotEventAddedSource = new Subject<IPlotEvent>();
  readonly plotEventAdded$ = this.plotEventAddedSource.asObservable();
  notifyPlotEventAdded(event: IPlotEvent) { this.plotEventAddedSource.next(event); }

  private readonly plotEventUpdatedSource = new Subject<IPlotEvent>();
  readonly plotEventUpdated$ = this.plotEventUpdatedSource.asObservable();
  notifyPlotEventUpdate(event: IPlotEvent) { this.plotEventUpdatedSource.next(event); }

  private readonly plotEventDeletedSource = new Subject<number>();
  readonly plotEventDeleted$ = this.plotEventDeletedSource.asObservable();
  notifyPlotEventDeleted(id: number) { this.plotEventDeletedSource.next(id); }

  // --- NEW: Chapter Sync ---
  private readonly chapterAddedSource = new Subject<IChapter>();
  readonly chapterAdded$ = this.chapterAddedSource.asObservable();
  notifyChapterAdded(chapter: IChapter) { this.chapterAddedSource.next(chapter); }

  private readonly chapterUpdatedSource = new Subject<IChapter>();
  readonly chapterUpdated$ = this.chapterUpdatedSource.asObservable();
  notifyChapterUpdate(chapter: IChapter) { this.chapterUpdatedSource.next(chapter); }

  private readonly chapterDeletedSource = new Subject<number>();
  readonly chapterDeleted$ = this.chapterDeletedSource.asObservable();
  notifyChapterDeleted(id: number) { this.chapterDeletedSource.next(id); }

  // --- NEW: Theme Sync ---
  private readonly themeAddedSource = new Subject<ITheme>();
  readonly themeAdded$ = this.themeAddedSource.asObservable();
  notifyThemeAdded(theme: ITheme) { this.themeAddedSource.next(theme); }

  private readonly themeUpdatedSource = new Subject<ITheme>();
  readonly themeUpdated$ = this.themeUpdatedSource.asObservable();
  notifyThemeUpdate(theme: ITheme) { this.themeUpdatedSource.next(theme); }

  private readonly themeDeletedSource = new Subject<number>();
  readonly themeDeleted$ = this.themeDeletedSource.asObservable();
  notifyThemeDeleted(id: number) { this.themeDeletedSource.next(id); }

  // --- NEW: Prop Sync ---
  private readonly propAddedSource = new Subject<IProp>();
  readonly propAdded$ = this.propAddedSource.asObservable();
  notifyPropAdded(prop: IProp) { this.propAddedSource.next(prop); }

  private readonly propUpdatedSource = new Subject<IProp>();
  readonly propUpdated$ = this.propUpdatedSource.asObservable();
  notifyPropUpdate(prop: IProp) { this.propUpdatedSource.next(prop); }

  private readonly propDeletedSource = new Subject<number>();
  readonly propDeleted$ = this.propDeletedSource.asObservable();
  notifyPropDeleted(id: number) { this.propDeletedSource.next(id); }
}
