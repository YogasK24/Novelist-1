// src/app/pages/dashboard/dashboard.component.ts
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { BookListComponent } from '../../components/dashboard/book-list/book-list.component';
import { AddBookButtonComponent } from '../../components/dashboard/add-book-button/add-book-button.component';
import { AddBookModalComponent } from '../../components/dashboard/add-book-modal/add-book-modal.component';
import type { IBook } from '../../../types/data';
import { SetTargetModalComponent } from '../../components/dashboard/set-target-modal/set-target-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NavbarComponent,
    BookListComponent,
    AddBookButtonComponent,
    AddBookModalComponent,
    SetTargetModalComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors duration-500 font-sans-ui">
      <app-navbar></app-navbar>
      
      <main class="container mx-auto px-4 py-12 max-w-7xl"> 
        <app-book-list 
          (editClicked)="handleOpenEditModal($event)"
          (setTargetClicked)="handleOpenSetTargetModal($event)">
        </app-book-list>
      </main>
      
      <app-add-book-button (addClicked)="handleOpenAddModal()"></app-add-book-button>

      @if (showModal()) {
        <app-add-book-modal 
          [bookToEdit]="editingBook()"
          (closeModal)="handleCloseModal()">
        </app-add-book-modal>
      }

      @if (showSetTargetModal()) {
        <app-set-target-modal
          [book]="bookForTarget()"
          (closeModal)="handleCloseSetTargetModal()">
        </app-set-target-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  showModal = signal(false);
  editingBook = signal<IBook | null>(null);

  showSetTargetModal = signal(false);
  bookForTarget = signal<IBook | null>(null);

  handleOpenAddModal(): void {
    this.editingBook.set(null);
    this.showModal.set(true);
  }

  handleOpenEditModal(book: IBook): void {
    this.editingBook.set(book);
    this.showModal.set(true);
  }

  handleCloseModal(): void {
    this.showModal.set(false);
    // Opsional: delay reset agar transisi mulus
    setTimeout(() => this.editingBook.set(null), 300); 
  }

  handleOpenSetTargetModal(book: IBook): void {
    this.bookForTarget.set(book);
    this.showSetTargetModal.set(true);
  }

  handleCloseSetTargetModal(): void {
    this.showSetTargetModal.set(false);
    setTimeout(() => this.bookForTarget.set(null), 300);
  }
}