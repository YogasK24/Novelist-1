// src/app/core/download.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  /**
   * Memicu download file JSON dari objek JavaScript.
   */
  downloadAsJson(data: any, filename: string): void {
    try {
      const jsonString = JSON.stringify(data, null, 2); // 'null, 2' untuk pretty-print
      const blob = new Blob([jsonString], { type: 'application/json' });
      this.triggerDownload(blob, filename);
    } catch (error) {
      console.error("Gagal membuat file JSON:", error);
    }
  }

  /**
   * Memicu download file Teks (.txt) dari string.
   */
  downloadAsText(data: string, filename: string): void {
    try {
      const blob = new Blob([data], { type: 'text/plain' });
      this.triggerDownload(blob, filename);
    } catch (error) {
      console.error("Gagal membuat file teks:", error);
    }
  }

  /**
   * Logika inti untuk membuat link dan mengkliknya secara virtual.
   */
  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a); // Diperlukan untuk Firefox
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
