// src/app/components/shared/generated-cover/generated-cover.component.ts
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generated-cover',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (gradientConfig(); as config) {
      <svg width="100%" height="100%" viewBox="0 0 100 150" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient [id]="gradientId()" [attr.gradientTransform]="'rotate(' + config.angle + ')'">
            <stop offset="0%" [attr.stop-color]="config.color1" />
            <stop offset="100%" [attr.stop-color]="config.color2" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" [attr.fill]="'url(#' + gradientId() + ')'" />
        
        <line x1="0" y1="0" x2="100" y2="150" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" />
        <line x1="100" y1="0" x2="0" y2="150" stroke="rgba(0,0,0,0.05)" stroke-width="0.5" />
      </svg>
    }
  `,
  // Jaga agar komponen tetap mengisi kontainer induknya
  styles: [`:host { display: block; width: 100%; height: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneratedCoverComponent {
  title = input.required<string>();
  id = input.required<number>();

  /**
   * Fungsi hash sederhana untuk mengubah string menjadi angka (benih).
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash | 0; // Konversi ke integer 32bit
    }
    return hash;
  }

  /**
   * ID unik untuk elemen <linearGradient> SVG.
   */
  readonly gradientId = computed(() => 'grad-' + this.id());

  /**
   * Menghasilkan konfigurasi gradien unik berdasarkan title dan id.
   * Ini menggunakan computed signal, jadi hanya akan dihitung ulang jika input berubah.
   */
  readonly gradientConfig = computed(() => {
    const titleHash = this.hashString(this.title());
    const idHash = this.id() || 1; // Pastikan id tidak 0

    // Hasilkan warna HSL (Hue, Saturation, Lightness) untuk gradien yang lebih bagus
    // Gunakan judul untuk menentukan rona dasar
    const hue1 = (titleHash % 360 + 360) % 360; 
    // Gunakan ID untuk membuat rona kedua yang serasi
    const hue2 = ((titleHash + idHash * 20) % 360 + 360) % 360; 
    
    // Tentukan sudut gradien dari ID
    const angle = (idHash % 90) + 45; // Sudut antara 45 dan 135 derajat

    const color1 = `hsl(${hue1}, 60%, 55%)`; // Warna pertama (sedang)
    const color2 = `hsl(${hue2}, 75%, 40%)`; // Warna kedua (lebih gelap & jenuh)

    return {
      angle,
      color1,
      color2,
    };
  });
}
