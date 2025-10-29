// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BookViewComponent } from './pages/book-view/book-view.component'; // <-- Akan dibuat

export const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'book/:id', component: BookViewComponent }, // <-- TAMBAHKAN RUTE INI
  // { path: 'book/:id/write', component: WritePageComponent }, // Nanti
  { path: '**', redirectTo: '' } 
];
