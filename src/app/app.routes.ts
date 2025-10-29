// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BookViewComponent } from './pages/book-view/book-view.component';
import { WritePageComponent } from './pages/write-page/write-page.component';
import { EditorPageComponent } from './pages/editor-page/editor-page.component';
import { WritePlaceholderComponent } from './components/write-page/write-placeholder/write-placeholder.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'book/:id', component: BookViewComponent },
  
  // Rute Penulisan dengan anak (nested routes)
  { 
    path: 'book/:id/write', 
    component: WritePageComponent,
    children: [
      // Tampilkan placeholder jika tidak ada bab yang dipilih
      { path: '', component: WritePlaceholderComponent, pathMatch: 'full' }, 
      // Tampilkan editor jika ada ID bab di URL
      { path: ':chapterId', component: EditorPageComponent } 
    ] 
  },
  
  { path: '**', redirectTo: '' }
];