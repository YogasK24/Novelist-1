// src/app/state/onboarding.service.ts
import { Injectable, signal } from '@angular/core';

const ONBOARDING_KEY = 'novelist_hasOnboarded';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  /**
   * Sinyal yang menunjukkan apakah pengguna telah menyelesaikan proses onboarding.
   * Nilainya dimuat dari localStorage saat layanan diinisialisasi.
   */
  readonly hasOnboarded = signal<boolean>(this.checkOnboardingStatus());

  /**
   * Memeriksa localStorage untuk melihat apakah flag onboarding sudah ada.
   * @returns `true` jika flag ada, `false` jika tidak.
   */
  private checkOnboardingStatus(): boolean {
    try {
      const status = localStorage.getItem(ONBOARDING_KEY);
      return status === 'true';
    } catch (e) {
      console.error('Gagal mengakses localStorage untuk status onboarding:', e);
      // Jika localStorage tidak tersedia, anggap onboarding sudah selesai
      // untuk mencegah modal muncul berulang kali.
      return true;
    }
  }

  /**
   * Menandai bahwa pengguna telah menyelesaikan proses onboarding.
   * Ini akan mengatur flag di localStorage dan memperbarui sinyal.
   */
  markAsOnboarded(): void {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      this.hasOnboarded.set(true);
    } catch (e) {
      console.error('Gagal menyimpan status onboarding ke localStorage:', e);
    }
  }
}