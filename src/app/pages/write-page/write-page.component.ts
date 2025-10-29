// src/app/pages/write-page/write-page.component.ts
// GANTI SELURUH ISI FILE INI

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router, RouterOutlet } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; 
import { CurrentBookStateService } from '../../state/current-book-state.service';
import { ChapterListComponent } from '../../components/book-view/chapter-list/chapter-list.component'; 
import { WorldDetailComponent } from '../../components/world-detail/world-detail.component'; // <-- Akan dibuat

@Component({
  selector: 'app-write-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    ChapterListComponent,
    WorldDetailComponent // <-- Komponen split view
  ],
  template: `
   <div class="min-h-screen bg-gray-900 text-gray-200 flex flex-col"> 
      
      <header class="bg-gray-800 shadow-lg sticky top-0 z-40">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between">
          <a [routerLink]="['/book', bookState.currentBookId()]" 
             class="text-white hover:text-gray-300 transition duration-150 p-2 -ml-2 rounded-full" 
             aria-label="Kembali ke World Building">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          
          <div class="flex-grow text-center text-sm font-semibold flex items-center justify-center gap-x-4">
              <span class="text-gray-400">
                  Today: 
                  <span class="text-white font-bold">{{ bookState.wordsWrittenToday() | number }}</span> / 
                  <span class="text-white">{{ bookState.dailyTarget() | number }}</span>
              </span>
              <div class="w-24 bg-gray-700 rounded-full h-2.5">
                  <div class="bg-purple-500 h-2.5 rounded-full" [style.width.%]="bookState.dailyProgressPercentage()"></div>
              </div>
              <span class="text-purple-400 font-bold">{{ bookState.dailyProgressPercentage() }}%</span>
          </div>
          
          <button (click)="toggleFocusMode()" 
                  class="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded w-28 text-center">
            {{ isFocusMode() ? 'Exit Focus' : 'Focus Mode' }}
          </button>
        </div>
      </header>

      <main class="flex-grow flex overflow-hidden">
        
        <div class="w-80 border-r border-gray-700 overflow-y-auto p-4 bg-gray-800 flex-shrink-0"
             [class.hidden]="isFocusMode()">
          <app-chapter-list-tab></app-chapter-list-tab>
        </div>
        
        <div class="flex-grow overflow-y-auto relative" 
             [class.w-full]="isFocusMode()">
          <router-outlet></router-outlet>
        </div>

        <div class="w-80 border-l border-gray-700 overflow-y-auto p-4 bg-gray-800 flex-shrink-0"
             [class.hidden]="isFocusMode()">
          <app-world-detail></app-world-detail>
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
  
  // Signal untuk Mode Fokus
  isFocusMode = signal(false);

  ngOnInit(): void {
    // Logic pemuatan ID buku tetap dipertahankan
    this.routeSub = this.route.params.subscribe(params => {
      const bookId = Number(params['id']); 
      if (!isNaN(bookId)) {
        this.bookState.loadBookData(bookId);
        this.bookState.loadWritingLogs(bookId);
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
    this.isFocusMode.update(val => !val);
  }
}
