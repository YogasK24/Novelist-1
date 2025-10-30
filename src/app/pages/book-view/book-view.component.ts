// src/app/pages/book-view/book-view.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { Subscription } from 'rxjs'; 
import { CurrentBookStateService } from '../../state/current-book-state.service'; 
import { BookViewHeaderComponent } from '../../components/book-view/book-view-header/book-view-header.component'; 
import { BookViewTabsComponent } from '../../components/book-view/book-view-tabs/book-view-tabs.component'; 
import { BottomNavComponent } from '../../components/book-view/bottom-nav/bottom-nav.component'; 

@Component({
  selector: 'app-book-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, 
    BookViewHeaderComponent,
    BookViewTabsComponent,
    BottomNavComponent
  ],
  template: `
   <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 flex flex-col transition-colors duration-500 font-sans-ui"> 
      <app-book-view-header></app-book-view-header>

      <main class="flex-grow container mx-auto px-4 py-10 max-w-7xl"> 
        @if (bookState.isLoadingBook()) {
          <div class="flex justify-center items-center py-10">
             <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 dark:border-purple-600"></div>
          </div>
        } @else if (bookState.currentBook()) { 
           <app-book-view-tabs></app-book-view-tabs>
        } @else {
          <div class="text-center py-10 text-red-400">
             Buku tidak ditemukan atau gagal dimuat. 
             <a [routerLink]="['/']" class="text-blue-400 hover:underline">Kembali ke Dashboard</a>
          </div>
        }
      </main>

      <app-bottom-nav></app-bottom-nav>

      <div class="h-16"></div> 
   </div>
  `
})
export class BookViewComponent implements OnInit, OnDestroy {
  // Inject services
  // FIX: Property 'params' does not exist on type 'unknown'. Explicitly type the injected ActivatedRoute.
  private route: ActivatedRoute = inject(ActivatedRoute);
  // Buat state service jadi public agar bisa diakses di template
  public bookState = inject(CurrentBookStateService); 

  private routeSub: Subscription | undefined;

  ngOnInit(): void {
    // Ambil ID buku dari parameter rute dan muat data
    this.routeSub = this.route.params.subscribe(params => {
      const bookId = Number(params['id']); // Konversi string ke number
      if (!isNaN(bookId)) {
        this.bookState.loadBookData(bookId);
      } else {
        console.error("Book ID tidak valid:", params['id']);
        this.bookState.clearBookData(); // Bersihkan jika ID tidak valid
      }
    });
  }

  ngOnDestroy(): void {
    // Penting: Unsubscribe dari parameter rute
    this.routeSub?.unsubscribe();
    // Penting: Bersihkan state buku saat keluar dari halaman ini
    this.bookState.clearBookData(); 
  }
}