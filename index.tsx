import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './src/app.component';
import { routes } from './src/app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    // FIX: Provide services from ReactiveFormsModule application-wide.
    // This ensures FormBuilder is available for dependency injection,
    // which resolves the "Property 'group' does not exist on type 'unknown'" error.
    importProvidersFrom(ReactiveFormsModule),
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.