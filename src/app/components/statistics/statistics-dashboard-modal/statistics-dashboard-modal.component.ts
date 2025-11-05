// src/app/components/statistics/statistics-dashboard-modal/statistics-dashboard-modal.component.ts
import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiStateService } from '../../../state/ui-state.service';
import { StatisticsService } from '../../../state/statistics.service';
import { BookStateService } from '../../../state/book-state.service';
import { HeatmapCalendarComponent } from '../heatmap-calendar/heatmap-calendar.component';
import { IconComponent } from '../../shared/icon/icon.component';
// (Nanti tambahkan: import { LineChartComponent } from '../line-chart/line-chart.component';)

@Component({
  selector: 'app-statistics-dashboard-modal',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DecimalPipe,
    HeatmapCalendarComponent,
    IconComponent
    // LineChartComponent
  ],
  template: `
    @if (uiState.isStatisticsModalOpen(); as isOpen) {
      <div 
        class="fixed inset-0 bg-black/70 flex justify-center items-center z-50
               transition-opacity duration-300"
        [class.opacity-100]="isOpen"
        [class.opacity-0]="!isOpen"
        (click)="uiState.closeStatisticsModal()" 
        aria-modal="true" role="dialog"
      >
        <div 
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[90vh]
                 ring-1 ring-black/5 dark:ring-white/10
                 transform transition-all duration-300 flex flex-col overflow-hidden"
          [class.opacity-100]="isOpen" [class.translate-y-0]="isOpen" [class.scale-100]="isOpen"
          [class.opacity-0]="!isOpen" [class.-translate-y-10]="!isOpen" [class.scale-95]="!isOpen"
          (click)="$event.stopPropagation()" 
        >
          <div class="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-300 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-200">
              Dasbor Statistik Penulis
            </h2>
            <button (click)="uiState.closeStatisticsModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500">
              <app-icon name="outline-x-mark-24" class="w-6 h-6"></app-icon>
            </button>
          </div>

          <div class="flex-grow p-6 min-h-0 overflow-y-auto">
            
            <div class="mb-6">
              <label for="statsFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tampilkan Statistik untuk:
              </label>
              <select id="statsFilter"
                      [ngModel]="selectedBookId"
                      (ngModelChange)="onFilterChange($event)"
                      class="w-full sm:w-1/2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                             text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-600">
                <option [ngValue]="null">Semua Novel</option>
                @for (book of bookState.books(); track book.id) {
                  <option [ngValue]="book.id">{{ book.title }}</option>
                }
              </select>
            </div>

            @if (statsService.isLoading()) {
              <div class="flex justify-center items-center py-20">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
              </div>
            } @else if (statsService.mainStats(); as stats) {
              <div class="space-y-6">
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 dark:text-gray-400">Total Kata</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalWords | number }}</div>
                  </div>
                  <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 dark:text-gray-400">Rata-rata / Hari (30d)</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.avgDailyWords | number }}</div>
                  </div>
                  <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 dark:text-gray-400">Streak Terpanjang</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.longestStreak }} hari</div>
                  </div>
                  <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div class="text-sm text-gray-600 dark:text-gray-400">Hari Produktif</div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.mostProductiveDay }}</div>
                  </div>
                </div>

                <app-heatmap-calendar 
                  [data]="statsService.heatmapData()">
                </app-heatmap-calendar>
                
                <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Grafik Pertumbuhan Kata (Segera Hadir)</h3>
                </div>

                <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                  <h3 class="font-semibold text-gray-900 dark:text-white">Papan Peringkat Novel (Segera Hadir)</h3>
                </div>

              </div>
            } @else {
              <p class="text-gray-500">Data statistik tidak tersedia.</p>
            }

          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsDashboardModalComponent {
  readonly uiState = inject(UiStateService);
  readonly statsService = inject(StatisticsService);
  readonly bookState = inject(BookStateService); // Untuk filter dropdown

  selectedBookId: number | null = null;
  
  constructor() {
    // Effect ini mengelola siklus hidup data statistik untuk memastikan data selalu segar.
    effect(() => {
      if (this.uiState.isStatisticsModalOpen()) {
        // Saat modal dibuka, muat data awal.
        this.statsService.loadInitialData();
      } else {
        // Saat modal ditutup, bersihkan data yang di-cache di service
        // agar data segar akan dimuat saat dibuka lagi. Ini memperbaiki bug data basi.
        this.statsService.clearData();
        // Reset juga filter dropdown lokal ke keadaan default.
        this.selectedBookId = null;
      }
    });
  }

  onFilterChange(bookId: number | null): void {
    // FIX: Tipe parameter sekarang akurat (number | null) berkat [ngValue].
    // Logika konversi yang rumit tidak lagi diperlukan.
    this.selectedBookId = bookId;
    this.statsService.calculateAllStats(bookId);
  }
}