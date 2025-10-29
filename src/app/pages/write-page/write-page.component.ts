// src/app/pages/write-page/write-page.component.ts
// GANTI SELURUH ISI FILE INI

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router, RouterOutlet } from '@angular/router'; 
import { CommonModule, DecimalPipe } from '@angular/common'; // Import DecimalPipe untuk header
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
    ChapterListComponent, // Ini adalah app-chapter-list-tab
    WorldDetailComponent, 
    WritePageHeaderComponent 
  ],
  template: `
   <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 flex flex-col transition-colors duration-500"> 
      
      <app-write-page-header 
          [isFocusMode]="!isChapterPanelOpen() && !isWorldPanelOpen()"
          (toggleFocusMode)="toggleFocusMode()">
      </app-write-page-header>
      
      <main class="flex-grow flex overflow-hidden relative">
        
        <button (click)="isChapterPanelOpen.set(true)" 
                class="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-gray-200/90 dark:bg-gray-800/90 hover:bg-purple-600 dark:hover:bg-purple-600 text-gray-800 dark:text-white rounded-r-lg shadow-lg transition duration-200"
                aria-label="Buka Chapter List"
                [class.hidden]="isChapterPanelOpen()">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
        
        <div class="border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 relative transition-all duration-300 ease-in-out overflow-hidden"
             [class.w-80]="isChapterPanelOpen()"
             [class.w-0]="!isChapterPanelOpen()">
          
          @if (isChapterPanelOpen()) {
              <button (click)="isChapterPanelOpen.set(false)" 
                      class="absolute top-2 right-2 z-40 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                      aria-label="Tutup Chapter List">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 11l-4 4l4 4m-4-4h12a2 2 0 002-2V7a2 2 0 00-2-2H3" /></svg>
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
                class="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-gray-200/90 dark:bg-gray-800/90 hover:bg-purple-600 dark:hover:bg-purple-600 text-gray-800 dark:text-white rounded-l-lg shadow-lg transition duration-200"
                aria-label="Buka World Notes"
                [class.hidden]="isWorldPanelOpen()">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div class="border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 relative transition-all duration-300 ease-in-out overflow-hidden"
             [class.w-80]="isWorldPanelOpen()"
             [class.w-0]="!isWorldPanelOpen()">

          @if (isWorldPanelOpen()) {
              <button (click)="isWorldPanelOpen.set(false)" 
                      class="absolute top-2 left-2 z-40 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
                      aria-label="Tutup World Notes">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public bookState = inject(CurrentBookStateService); 

  private routeSub: Subscription | undefined;
  
  isChapterPanelOpen = signal(true); 
  isWorldPanelOpen = signal(true);
  
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const bookId = Number(params['id']); 
      if (!isNaN(bookId)) {
        this.bookState.loadBookData(bookId);
        this.bookState.loadWritingLogs(bookId);
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
  
  toggleFocusMode(): void {
    const isCurrentlyFocus = !this.isChapterPanelOpen() && !this.isWorldPanelOpen();
    if (isCurrentlyFocus) {
      this.isChapterPanelOpen.set(true);
      this.isWorldPanelOpen.set(true);
    } else {
      this.isChapterPanelOpen.set(false);
      this.isWorldPanelOpen.set(false);
    }
  }
}