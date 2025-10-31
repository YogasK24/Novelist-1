// src/app/state/backup.service.ts
import { Injectable, inject } from '@angular/core';
import { DatabaseService, IFullBackupDatabase } from './database.service';
import { DownloadService } from '../core/download.service';
import { NotificationService } from './notification.service';
import type { IChapter } from '../../types/data';

// Definisikan struktur file backup kita
interface IFullBackup {
  version: number;
  timestamp: string;
  database: IFullBackupDatabase;
  settings: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private db = inject(DatabaseService);
  private downloader = inject(DownloadService);
  private notifier = inject(NotificationService);

  private readonly BACKUP_VERSION = 1;
  private readonly SETTINGS_PREFIX = 'settings_';

  // =============================================
  // --- FITUR EKSPOR (BACKUP LENGKAP) ---
  // =============================================
  async exportFullBackup(): Promise<void> {
    try {
      this.notifier.info("Memulai backup... Ini mungkin perlu waktu.");

      // 1. Kumpulkan semua data dari Database
      const databaseData = await this.db.exportAllData();
      
      // 2. Kumpulkan semua data dari LocalStorage (Pengaturan)
      const settings: { [key: string]: string } = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.SETTINGS_PREFIX)) {
          settings[key] = localStorage.getItem(key)!;
        }
      }

      // 3. Gabungkan ke dalam satu objek
      const backupData: IFullBackup = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        database: databaseData,
        settings: settings
      };

      // 4. Picu download
      const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      this.downloader.downloadAsJson(backupData, `novelist-backup-${dateStr}.json`);
      
      this.notifier.success("Backup lengkap berhasil diunduh!");

    } catch (error: any) {
      console.error("Gagal melakukan backup:", error);
      this.notifier.error(`Backup Gagal: ${error.message}`);
    }
  }

  // =============================================
  // --- FITUR IMPOR (BACKUP LENGKAP) ---
  // =============================================
  async importFullBackup(file: File): Promise<void> {
    try {
      this.notifier.info("Membaca file backup...");
      const text = await file.text();
      const data = JSON.parse(text) as IFullBackup;

      // Validasi file
      if (!data.version || !data.database || !data.settings) {
        throw new Error("Format file backup tidak valid.");
      }

      this.notifier.info("Memvalidasi... Memulai impor. JANGAN TUTUP APLIKASI.");

      // 1. Hapus semua data lama dan masukkan data baru
      await this.db.importAllData(data.database);

      // 2. Hapus pengaturan lama dan terapkan pengaturan baru
      localStorage.clear(); // Hapus semua
      for (const key in data.settings) {
        if (Object.prototype.hasOwnProperty.call(data.settings, key)) {
          localStorage.setItem(key, data.settings[key]);
        }
      }
      
      this.notifier.success("Impor berhasil! Aplikasi akan dimuat ulang.");

      // 3. Muat ulang aplikasi agar semua service (terutama Settings)
      //    mengambil data baru dari localStorage.
      setTimeout(() => {
        window.location.reload();
      }, 2000); // Tunggu 2 detik agar notifikasi terbaca

    } catch (error: any) {
      console.error("Gagal melakukan impor:", error);
      this.notifier.error(`Impor Gagal: ${error.message}`);
    }
  }

  // =============================================
  // --- FITUR EKSPOR (BAB TUNGGAL) ---
  // =============================================

  /**
   * Mengonversi konten delta Quill (JSON) menjadi string teks biasa.
   */
  private convertQuillDeltaToText(content: string): string {
    if (!content) return "";
    try {
      if (content.trim().startsWith('{')) {
        const delta = JSON.parse(content);
        if (delta && Array.isArray(delta.ops)) {
          return delta.ops.reduce((text: string, op: any) => {
            if (typeof op.insert === 'string') {
              return text + op.insert;
            }
            return text;
          }, "");
        }
      }
    } catch (e) { /* Jatuh ke fallback di bawah */ }
    
    // Fallback jika konten BUKAN JSON (teks biasa)
    return content;
  }

  async exportChapterAsText(chapter: IChapter): Promise<void> {
    try {
      const plainText = this.convertQuillDeltaToText(chapter.content);
      
      // Sanitasi nama file (menghapus karakter yang tidak valid)
      const safeFilename = (chapter.title || 'Untitled').replace(/[^a-z0-9_-\s]/gi, '').trim();
      
      this.downloader.downloadAsText(plainText, `${safeFilename}.txt`);
      this.notifier.success(`Bab "${chapter.title}" berhasil diekspor.`);
      
    } catch (error: any) {
      console.error("Gagal mengekspor bab:", error);
      this.notifier.error(`Ekspor Gagal: ${error.message}`);
    }
  }
}
