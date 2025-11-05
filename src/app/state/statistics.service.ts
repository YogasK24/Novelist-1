// src/app/state/statistics.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { DatabaseService } from './database.service';
import type { IWritingLog, IBookWithStats, IBook } from '../../types/data';

// Tipe data untuk hasil kalkulasi
export interface AuthorStats {
  totalWords: number;
  avgDailyWords: number;
  longestStreak: number;
  mostProductiveDay: string;
}
export type HeatmapData = Map<string, number>; // "YYYY-MM-DD" -> wordCount

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private db = inject(DatabaseService);

  // State
  readonly isLoading = signal(false);
  
  // Sinyal privat untuk menampung data mentah. Data ini dikelola oleh komponen modal.
  private allWritingLogs = signal<IWritingLog[]>([]);
  private allBooks = signal<IBook[]>([]);

  // Sinyal publik untuk hasil
  readonly mainStats = signal<AuthorStats | null>(null);
  readonly heatmapData = signal<HeatmapData>(new Map());
  // (Stub untuk leaderboard & line chart)
  readonly leaderboards = signal<any>(null); 

  /**
   * Pintu masuk utama. Mengambil SEMUA data dan memicu kalkulasi.
   * Metode ini sengaja dirancang untuk memuat data hanya sekali saat modal statistik terbuka
   * untuk mencegah pengambilan data berulang yang tidak perlu.
   */
  async loadInitialData(): Promise<void> {
    if (this.isLoading() || this.allWritingLogs().length > 0) return; // Sudah dimuat untuk sesi ini
    this.isLoading.set(true);
    
    try {
      // Ambil data mentah sekali saja
      const [logs, books] = await Promise.all([
        this.db.getAllWritingLogs(),
        this.db.getAllBooks()
      ]);
      this.allWritingLogs.set(logs);
      this.allBooks.set(books);
      
      // Hitung statistik global awal
      this.calculateAllStats(null); // null = "Semua Novel"
      
    } catch (e) {
      console.error("Gagal memuat data statistik:", e);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Membersihkan data yang di-cache. Dipanggil oleh komponen modal saat ditutup
   * untuk memastikan data segar dimuat saat dibuka kembali.
   */
  clearData(): void {
    // FIX: Reset loading state to prevent it getting stuck on `true`
    // if the modal is closed mid-load.
    this.isLoading.set(false);
    this.allWritingLogs.set([]);
    this.allBooks.set([]);
    this.mainStats.set(null);
    this.heatmapData.set(new Map());
  }

  /**
   * Menghitung ulang semua statistik berdasarkan filter.
   */
  calculateAllStats(bookId: number | null): void {
    // Tentukan log mana yang akan digunakan
    const logsToProcess = (bookId === null)
      ? this.allWritingLogs()
      : this.allWritingLogs().filter(log => log.bookId === bookId);
      
    // **LOGIKA BARU**: Hitung total kata dari data buku, bukan dari log.
    const booksToProcess = (bookId === null)
      ? this.allBooks()
      : this.allBooks().filter(book => book.id === bookId);
    const totalWords = booksToProcess.reduce((sum, book) => sum + (book.wordCount || 0), 0);

    // Jalankan kalkulasi lainnya
    const stats = this.calculateMainStats(logsToProcess, totalWords); // Kirim totalWords
    const heatmap = this.createHeatmapData(logsToProcess);
    
    // Set sinyal hasil
    this.mainStats.set(stats);
    this.heatmapData.set(heatmap);
  }

  // --- Logika Kalkulasi ---

  private calculateMainStats(logs: IWritingLog[], totalWords: number): AuthorStats {
    // Jika tidak ada log untuk statistik berbasis aktivitas, kembalikan nilai default untuknya,
    // tetapi tetap gunakan totalWords yang benar dari data buku.
    if (logs.length === 0) {
      return { totalWords: totalWords, avgDailyWords: 0, longestStreak: 0, mostProductiveDay: 'N/A' };
    }

    // "Total words" sekarang diteruskan sebagai argumen, jadi tidak perlu dihitung di sini.

    // 2. Rata-rata 30 hari
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysTimestamp = thirtyDaysAgo.toISOString().split('T')[0];
    
    const recentLogs = logs.filter(log => log.date >= thirtyDaysTimestamp);
    const recentWords = recentLogs.reduce((sum, log) => sum + log.wordCountAdded, 0);
    const avgDailyWords = Math.round(recentWords / 30);

    // 3. Streak Terpanjang (Logika kompleks)
    const logDates = new Set(logs.map(log => log.date));
    let longestStreak = 0;
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      if (logDates.has(dateString)) {
        currentStreak++;
      } else {
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
        currentStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak); // Cek streak terakhir

    // 4. Hari Paling Produktif
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const wordsPerDay = new Array(7).fill(0);
    logs.forEach(log => {
      const dayIndex = new Date(log.date).getUTCDay(); // 0 = Minggu, 1 = Senin...
      wordsPerDay[dayIndex] += log.wordCountAdded;
    });
    
    const maxWords = Math.max(...wordsPerDay);
    const productiveDayIndex = wordsPerDay.indexOf(maxWords);
    const mostProductiveDay = dayNames[productiveDayIndex];

    return { totalWords, avgDailyWords, longestStreak, mostProductiveDay };
  }
  
  private createHeatmapData(logs: IWritingLog[]): HeatmapData {
    const map: HeatmapData = new Map();
    logs.forEach(log => {
      map.set(log.date, (map.get(log.date) || 0) + log.wordCountAdded);
    });
    return map;
  }
}