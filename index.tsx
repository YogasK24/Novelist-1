import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './src/app.component';
import { routes } from './src/app/app.routes';

// Tambahkan fungsi untuk mendaftarkan Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Nama Service Worker yang umum digunakan di proyek Angular/Vite
      // FIX: Use a relative path for the service worker to prevent cross-origin errors
      // in sandboxed environments. The leading '/' caused it to resolve to the
      // wrong origin.
      navigator.serviceWorker.register('ngsw-worker.js') 
        .then(reg => console.log('Service Worker registered: ', reg.scope))
        .catch(err => console.log('Service Worker registration failed: ', err));
    });
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    // FIX: Provide services from ReactiveFormsModule application-wide.
    // This ensures FormBuilder is available for dependency injection,
    // which resolves the "Property 'group' does not exist on type 'unknown'" error.
    importProvidersFrom(ReactiveFormsModule),
  ],
}).then(() => { // Gunakan .then() untuk mendaftarkan SW setelah bootstrap berhasil
    // Panggil pendaftaran setelah aplikasi di-bootstrap
    registerServiceWorker(); 
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.