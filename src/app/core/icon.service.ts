// src/app/core/icon.service.ts
// (File BARU)

import { Injectable } from '@angular/core';
import { ICONS } from './icon.model';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private iconMap = ICONS;

  /**
   * Mengambil data path SVG untuk sebuah ikon berdasarkan namanya.
   * @param name Nama ikon (e.g., 'solid-trash-20' atau 'outline-plus-24')
   * @returns Array dari string path data, atau undefined jika tidak ditemukan.
   */
  getIcon(name: string): string[] | undefined {
    return this.iconMap.get(name);
  }
}
