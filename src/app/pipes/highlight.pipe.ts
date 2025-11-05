// src/app/pipes/highlight.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  transform(text: string, search: string): string {
    if (!search || !text) {
      return text;
    }

    // Escape karakter khusus untuk regex
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearch, 'gi');
    
    // Ganti teks yang cocok dengan versi yang dibungkus tag strong
    return text.replace(regex, (matchedText) => 
        `<strong class="font-bold text-accent-700 dark:text-accent-300 bg-accent-100 dark:bg-accent-900/50 rounded-sm px-0.5">${matchedText}</strong>`
    );
  }
}
