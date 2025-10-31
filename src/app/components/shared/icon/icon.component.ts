// src/app/components/shared/icon/icon.component.ts
// (File BARU)

import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from '../../../core/icon.service';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      [attr.viewBox]="viewBox()"
      [attr.fill]="isSolid() ? 'currentColor' : 'none'"
      [attr.stroke]="isSolid() ? 'none' : 'currentColor'"
      [attr.stroke-width]="isSolid() ? '0' : '1.5'"
      class="w-full h-full"
      aria-hidden="true">
      
      @for (path of iconPaths(); track $index) {
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          [attr.d]="path"
          [attr.fill-rule]="isSolid() ? 'evenodd' : null"
          [attr.clip-rule]="isSolid() ? 'evenodd' : null"
        />
      }
    </svg>
  `,
  // Host binding untuk menerapkan class default (w-5 h-5)
  // Ini memungkinkan pengguna menimpanya: <app-icon name="x" class="w-6 h-6">
  host: {
    '[class]': 'cssClass()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private iconService = inject(IconService);

  /**
   * Nama ikon yang akan dirender (e.g., 'solid-trash-20' atau 'outline-home-24').
   */
  readonly name = input.required<string>();
  
  /**
   * Class CSS kustom yang akan ditambahkan ke host element, 
   * terutama untuk ukuran (e.g., 'w-6 h-6').
   * Jika tidak diset, akan default ke 'w-5 h-5'.
   */
  readonly class = input<string>('');

  // Sinyal internal untuk menentukan path data
  protected iconPaths = computed(() => {
    return this.iconService.getIcon(this.name()) ?? [];
  });

  // Sinyal internal untuk menentukan tipe ikon
  protected isSolid = computed(() => {
    return this.name().startsWith('solid-');
  });

  // Sinyal internal untuk menentukan viewBox
  protected viewBox = computed(() => {
    // Solid icons 20x20
    if (this.isSolid()) {
      return '0 0 20 20';
    }
    // Outline icons 24x24
    return '0 0 24 24';
  });
  
  // Sinyal internal untuk class host
  protected cssClass = computed(() => {
    // Jika pengguna tidak menyediakan class ukuran, default ke w-5 h-5
    const hasSizeClass = this.class().includes('w-') || this.class().includes('h-');
    const defaultSize = hasSizeClass ? '' : 'w-5 h-5';
    
    // Selalu pastikan 'inline-block' agar ikon sejajar dengan teks
    return `inline-block ${defaultSize} ${this.class()}`;
  });
}
