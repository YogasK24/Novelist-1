// src/app/pages/write-page/write-page.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router, RouterOutlet } from '@angular/router'; 
import { CommonModule, DecimalPipe } from '@angular/common'; 
import { Subscription } from 'rxjs'; 
import { CurrentBookStateService } from '../../state/current-book-state.service';
import { ChapterListComponent } from '../../components/write-page/chapter-list/chapter-list.component'; 
import { WorldDetailComponent } from '../../components/world-detail/world-detail.component'; 
import { WritePageHeaderComponent } from '../../components/write-page/write-page-header/write-page-header.component'; 
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-write-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    ChapterListComponent, 
    WorldDetailComponent, 
    WritePageHeaderComponent,
    IconComponent
  ],
  template: `
   <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 flex flex-col transition-colors duration-500 font-sans-ui"> 
      
      <app-write-page-header 
          [isFocusMode]="!isChapterPanelOpen() && !isWorldPanelOpen()"
          (toggleFocusMode)="toggleFocusMode()">
      </app-write-page-header>
      
      <main class="flex-grow flex overflow-hidden relative"> 
        
        <button (click)="openChapterPanel()" 
                class="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-2 
                       bg-gray-200/90 dark:bg-gray-800/90 
                       hover:bg-gray-300 dark:hover:bg-gray-700 
                       text-gray-800 dark:text-white rounded-r-lg shadow-lg 
                       transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Open Chapter List"
                [class.hidden]="isChapterPanelOpen()">
           <app-icon name="outline-chevron-double-right-24" class="w-5 h-5"></app-icon>
        </button>
        
        <div class="border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 relative 
                    transition-all duration-300 ease-in-out overflow-hidden shadow-2xl" 
             [class.w-80]="isChapterPanelOpen()"
             [class.w-0]="!isChapterPanelOpen()">
          
          @if (isChapterPanelOpen()) {
              <button (click)="isChapterPanelOpen.set(false)" 
                      class="absolute top-2 right-2 z-40 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-full"
                      aria-label="Close Chapter List">
                  <app-icon name="outline-chevron-double-left-24" class="w-5 h-5"></app-icon>
              </button>
          }
          
          <div class="h-full overflow-y-auto"
               [class.p-4]="isChapterPanelOpen()"
               [class.p-0]="!isChapterPanelOpen()">
             @if (isChapterPanelOpen()) { 
                 <app-write-chapter-list></app-write-chapter-list>
             }
          </div>
        </div>
        
        <div class="flex-grow overflow-y-auto relative min-w-0"> 
          <router-outlet></router-outlet>
        </div>

        <button (click)="openWorldPanel()" 
                class="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-2 
                       bg-gray-200/90 dark:bg-gray-800/90 
                       hover:bg-gray-300 dark:hover:bg-gray-700 
                       text-gray-800 dark:text-white rounded-l-lg shadow-lg 
                       transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-accent-500"
                aria-label="Open World Notes"
                [class.hidden]="isWorldPanelOpen()">
             <app-icon name="outline-chevron-double-left-24" class="w-5 h-5"></app-icon>
        </button>
        
        <div class="border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 relative 
                    transition-all duration-300 ease-in-out overflow-hidden shadow-2xl"
             [class.w-80]="isWorldPanelOpen()"
             [class.w-0]="!isWorldPanelOpen()">

          @if (isWorldPanelOpen()) {
              <button (click)="isWorldPanelOpen.set(false)" 
                      class="absolute top-2 left-2 z-40 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-full"
                      aria-label="Close World Notes">
                  <app-icon name="outline-chevron-double-right-24" class="w-5 h-5"></app-icon>
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
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  public bookState = inject(CurrentBookStateService); 

  private routeSub: Subscription | undefined;
  
  isChapterPanelOpen = signal(true); 
  isWorldPanelOpen = signal(false);
  
  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const bookId = Number(params['id']); 
      if (!isNaN(bookId)) {
        this.bookState.loadBookData(bookId);
        this.bookState.loadWritingLogs(bookId);
        this.bookState.loadCharacters(bookId);
        this.bookState.loadLocations(bookId);
        this.bookState.loadPlotEvents(bookId);
        this.bookState.loadChapters(bookId);
      } else {
        console.error("Book ID not valid:", params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.bookState.clearBookData();
  }

  openChapterPanel(): void {
    this.isChapterPanelOpen.set(true);
  }

  openWorldPanel(): void {
    this.isWorldPanelOpen.set(true);
  }
  
  toggleFocusMode(): void {
    const isCurrentlyFocus = !this.isChapterPanelOpen() && !this.isWorldPanelOpen();
    if (isCurrentlyFocus) {
      this.isChapterPanelOpen.set(true);
      this.isWorldPanelOpen.set(false);
    } else {
      this.isChapterPanelOpen.set(false);
      this.isWorldPanelOpen.set(false);
    }
  }
}