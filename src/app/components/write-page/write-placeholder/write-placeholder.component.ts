// src/app/components/write-page/write-placeholder/write-placeholder.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-write-placeholder',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex h-full w-full items-center justify-center p-4 text-center">
      <div class="max-w-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-slate-800 dark:text-white">
          Selamat Datang di Mode Tulis
        </h2>
        <p class="mt-2 text-slate-500 dark:text-slate-400">
          Pilih sebuah bab dari daftar di sebelah kiri untuk mulai menulis atau mengedit konten Anda.
        </p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WritePlaceholderComponent {}