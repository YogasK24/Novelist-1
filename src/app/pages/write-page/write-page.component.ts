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
   <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 flex flex-col transition-colors duration-500 font-sans-ui h-screen overflow-hidden"> 
      
      <app-write-page-header 
          [isFocusMode]="!isChapterPanelOpen() && !isWorldPanelOpen()"
          (toggleFocusMode)="toggleFocusMode()">
      </app-write-page-header>
      
      <main class="flex-grow flex overflow-hidden relative"> 
        
        <!-- Tombol Buka/Tutup Panel Bab -->
        <button (click)="toggleChapterPanel()" 
                class="absolute top-1/2 -translate-y-1/2 z-50 w-8 h-8 flex items-center justify-center
                       bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full shadow-md
                       text-gray-800 dark:text-white transition-all duration-300 ease-in-out
                       hover:scale-110 hover:bg-gray-300/80 dark:hover:bg-gray-700/80
                       focus:outline-none focus:ring-2 focus:ring-accent-500"
                [class.left-2]="!isChapterPanelOpen()"
                [class.left-64]="isChapterPanelOpen()"
                [class.lg:left-80]="isChapterPanelOpen()"
                [class.-ml-4]="isChapterPanelOpen()"
                aria-label="Toggle Chapter List">
           @if(isChapterPanelOpen()) {
              <app-icon name="outline-chevron-double-left-24" class="w-5 h-5 transition-transform duration-300"></app-icon>
           } @else {
              <app-icon name="outline-chevron-double-right-24" class="w-5 h-5 transition-transform duration-300"></app-icon>
           }
        </button>
        
        <!-- Panel Bab (Responsif) -->
        <div class="fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-gray-800
                    shadow-2xl transition-transform duration-300 ease-in-out
                    lg:relative lg:z-auto lg:shadow-none lg:translate-x-0"
             [class.translate-x-0]="isChapterPanelOpen()"
             [class.-translate-x-full]="!isChapterPanelOpen()"
             [class.w-64]="isChapterPanelOpen()"
             [class.lg:w-80]="isChapterPanelOpen()"
             [class.w-0]="!isChapterPanelOpen()">
          
          <div class="h-full overflow-y-auto"
               [class.opacity-100]="isChapterPanelOpen()"
               [class.opacity-0]="!isChapterPanelOpen()">
             @if (isChapterPanelOpen()) { 
                 <div class="px-4 pb-4 h-full pt-14">
                    <app-write-chapter-list></app-write-chapter-list>
                 </div>
             }
          </div>
        </div>
        
        <!-- Area Konten Utama (Editor) -->
        <div class="flex-grow overflow-y-auto relative min-w-0 transition-all duration-300 ease-in-out"> 
          <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <router-outlet></router-outlet>
          </div>
        </div>

        <!-- Tombol Buka/Tutup Panel Dunia -->
        <button (click)="toggleWorldPanel()" 
                class="absolute top-1/2 -translate-y-1/2 z-50 w-8 h-8 flex items-center justify-center
                       bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full shadow-md
                       text-gray-800 dark:text-white transition-all duration-300 ease-in-out
                       hover:scale-110 hover:bg-gray-300/80 dark:hover:bg-gray-700/80
                       focus:outline-none focus:ring-2 focus:ring-accent-500"
                [class.right-2]="!isWorldPanelOpen()"
                [class.right-64]="isWorldPanelOpen()"
                [class.lg:right-80]="isWorldPanelOpen()"
                [class.-mr-4]="isWorldPanelOpen()"
                aria-label="Toggle World Notes">
             @if(isWorldPanelOpen()) {
                <app-icon name="outline-chevron-double-right-24" class="w-5 h-5 transition-transform duration-300"></app-icon>
             } @else {
                <app-icon name="outline-chevron-double-left-24" class="w-5 h-5 transition-transform duration-300"></app-icon>
             }
        </button>
        
        <!-- Panel Dunia (Responsif) -->
        <div class="fixed top-0 bottom-0 right-0 z-40 bg-white dark:bg-gray-800
                    shadow-2xl transition-transform duration-300 ease-in-out
                    lg:relative lg:z-auto lg:shadow-none lg:translate-x-0"
             [class.translate-x-0]="isWorldPanelOpen()"
             [class.translate-x-full]="!isWorldPanelOpen()"
             [class.w-64]="isWorldPanelOpen()"
             [class.lg:w-80]="isWorldPanelOpen()"
             [class.w-0]="!isWorldPanelOpen()">

          <div class="h-full overflow-y-auto"
               [class.opacity-100]="isWorldPanelOpen()"
               [class.opacity-0]="!isWorldPanelOpen()">
             @if (isWorldPanelOpen()) {
                <div class="px-4 pb-4 h-full pt-14">
                    <app-world-detail></app-world-detail>
                </div>
             }
          </div>
        </div>

        <!-- Backdrop untuk Mobile/Tablet -->
        @if ((isChapterPanelOpen() || isWorldPanelOpen()) && isMobileView()) {
          <div (click)="closePanels()"
               class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden">
          </div>
        }

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
  
  // State untuk mendeteksi viewport mobile/tablet
  private mediaQuery = window.matchMedia('(max-width: 1023px)'); // lg breakpoint
  isMobileView = signal(this.mediaQuery.matches);
  private mediaQueryListener = (e: MediaQueryListEvent) => this.isMobileView.set(e.matches);

  ngOnInit(): void {
    // Di layar besar, defaultnya buka panel bab. Di mobile/tablet, defaultnya fokus.
    if (!this.isMobileView()) {
        this.isChapterPanelOpen.set(true);
        this.isWorldPanelOpen.set(false);
    } else {
        this.isChapterPanelOpen.set(false);
        this.isWorldPanelOpen.set(false);
    }

    this.routeSub = this.route.params.subscribe(params => {
      const bookId = Number(params['id']); 
      if (!isNaN(bookId)) {
        this.bookState.loadBookData(bookId);
        this.bookState.loadWritingLogs(bookId);
        // Data dunia (karakter, dll.) akan dimuat secara lazy oleh komponennya
        this.bookState.loadChapters(bookId); // Tetap muat bab untuk navigasi
      } else {
        console.error("Book ID not valid:", params['id']);
      }
    });

    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.bookState.clearBookData();
    this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
  }
  
  closePanels(): void {
    this.isChapterPanelOpen.set(false);
    this.isWorldPanelOpen.set(false);
  }

  toggleFocusMode(): void {
    const isCurrentlyFocus = !this.isChapterPanelOpen() && !this.isWorldPanelOpen();
    if (isCurrentlyFocus) {
      this.isChapterPanelOpen.set(true);
      this.isWorldPanelOpen.set(false);
    } else {
      this.closePanels();
    }
  }

  toggleChapterPanel(): void {
    const opening = !this.isChapterPanelOpen();
    this.isChapterPanelOpen.set(opening);
    if (opening) {
      this.isWorldPanelOpen.set(false);
    }
  }

  toggleWorldPanel(): void {
    const opening = !this.isWorldPanelOpen();
    this.isWorldPanelOpen.set(opening);
    if (opening) {
      this.isChapterPanelOpen.set(false);
    }
  }
}
