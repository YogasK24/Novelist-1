// src/app/pages/write-page/write-page.component.ts
// GANTI SELURUH ISI FILE INI

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router, RouterOutlet } from '@angular/router'; 
import { CommonModule, DecimalPipe } from '@angular/common'; 
import { Subscription } from 'rxjs'; 
import { CurrentBookStateService } from '../../state/current-book-state.service';
import { ChapterListComponent } from '../../components/book-view/chapter-list/chapter-list.component'; 
import { WorldDetailComponent } from '../../components/world-detail/world-detail.component'; 
import { WritePageHeaderComponent } from '../../components/write-page/write-page-header/write-page-header.component'; 

@Component({
  selector: 'app-write-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    ChapterListComponent, 
    WorldDetailComponent, 
    WritePageHeaderComponent 
  ],
  template: `
   <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 flex flex-col transition-colors duration-500 font-sans-ui"> 
      
      <app-write-page-header 
          [isFocusMode]="!isChapterPanelOpen() && !isWorldPanelOpen()"
          (toggleFocusMode)="toggleFocusMode()">
      </app-write-page-header>
      
      <main class="flex-grow flex overflow-hidden relative"> 
        
        <button (click)="isChapterPanelOpen.set(true)" 
                class="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-2 
                       bg-gray-200/90 dark:bg-gray-800/90 
                       hover:bg-gray-300 dark:hover:bg-gray-700 
                       text-gray-800 dark:text-white rounded-r-lg shadow-lg 
                       transition-all duration-200"
                aria-label="Buka Chapter List"
                [class.hidden]="isChapterPanelOpen()">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
             <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
           </svg>
        </button>
        
        <div class="border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 relative 
                    transition-all duration-300 ease-in-out overflow-hidden shadow-2xl" 
             [class.w-80]="isChapterPanelOpen()"
             [class.w-0]="!isChapterPanelOpen()">
          
          @if (isChapterPanelOpen()) {
              <button (click)="isChapterPanelOpen.set(false)" 
                      class="absolute top-2 right-2 z-40 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                      aria-label="Tutup Chapter List">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                  </svg>
              </button>
          }
          
          <div class="h-full overflow-y-auto"
               [class.p-4]="isChapterPanelOpen()"
               [class.p-0]="!isChapterPanelOpen()">
             @if (isChapterPanelOpen()) { 
                 <app-chapter-list-tab></app-chapter-list-tab>
             }
          </div>
        </div>
        
        <div class="flex-grow overflow-y-auto relative min-w-0"> 
          <router-outlet></router-outlet>
        </div>

        <button (click)="isWorldPanelOpen.set(true)" 
                class="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-2 
                       bg-gray-200/90 dark:bg-gray-800/90 
                       hover:bg-gray-300 dark:hover:bg-gray-700 
                       text-gray-800 dark:text-white rounded-l-lg shadow-lg 
                       transition-all duration-200"
                aria-label="Buka World Notes"
                [class.hidden]="isWorldPanelOpen()">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
             </svg>
        </button>
        
        <div class="border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 relative 
                    transition-all duration-300 ease-in-out overflow-hidden shadow-2xl"
             [class.w-80]="isWorldPanelOpen()"
             [class.w-0]="!isWorldPanelOpen()">

          @if (isWorldPanelOpen()) {
              <button (click)="isWorldPanelOpen.set(false)" 
                      class="absolute top-2 left-2 z-40 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                      aria-label="Tutup World Notes">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                  </svg>
              </button>
          }

          <div class="h-full overflow-y-auto"
               [class.p-4]="isWorldPanelOpen()"
               [class.p-0]="!isWorldPanelOpen()">
             @if (isWorldPanelOpen()) {
                <app-world-detail></app-world-detail>
             }
          </div>
        </div>

      </main>
      
   </div>
  `
})
export class WritePageComponent implements OnInit, OnDestroy {
  // FIX: Property 'params' does not exist on type 'unknown'. Explicitly type the injected ActivatedRoute.
  private route: ActivatedRoute = inject(ActivatedRoute);
  // FIX: Property 'params' does not exist on type 'unknown'. Explicitly type the injected Router.
  private router: Router = inject(Router);
  public bookState = inject(CurrentBookStateService); 

  private routeSub: Subscription | undefined;
  
  // State BARU untuk kontrol sidebar individual (default BUKA)
  isChapterPanelOpen = signal(true); 
  isWorldPanelOpen = signal(true);
  
  // Hapus isFocusMode lama

  ngOnInit(): void {
    // Logic pemuatan ID buku tetap dipertahankan
    this.routeSub = this.route.params.subscribe(params => {
      const bookId = Number(params['id']); 
      if (!isNaN(bookId)) {
        this.bookState.loadBookData(bookId);
        this.bookState.loadWritingLogs(bookId);
        // Pastikan juga data World Detail dimuat saat halaman tulis dibuka
        this.bookState.loadCharacters(bookId);
        this.bookState.loadLocations(bookId);
        this.bookState.loadPlotEvents(bookId);
      } else {
        console.error("Book ID tidak valid:", params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.bookState.clearBookData();
  }
  
  // Logika toggleFocusMode BARU (Super-Focus)
  toggleFocusMode(): void {
    const isCurrentlyFocus = !this.isChapterPanelOpen() && !this.isWorldPanelOpen();
    if (isCurrentlyFocus) {
      // Keluar dari Focus Mode: Buka kedua panel
      this.isChapterPanelOpen.set(true);
      this.isWorldPanelOpen.set(true);
    } else {
      // Masuk ke Focus Mode: Tutup kedua panel
      this.isChapterPanelOpen.set(false);
      this.isWorldPanelOpen.set(false);
    }
  }
}