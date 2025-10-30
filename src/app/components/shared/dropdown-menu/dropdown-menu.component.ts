// src/app/components/shared/dropdown-menu/dropdown-menu.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, ElementRef, viewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuItem {
  label?: string;
  action?: string;
  isDanger?: boolean;
  isSeparator?: boolean;
}

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div #menuElement
           class="fixed z-50 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg 
                  ring-1 ring-black dark:ring-gray-600 ring-opacity-5
                  transform transition-all duration-100 ease-out"
           [style.top.px]="position.top"
           [style.left.px]="position.left"
           [style.opacity]="isVisible ? 1 : 0"
           [style.transform]="isVisible ? 'scale(1)' : 'scale(0.95)'"
           (click)="$event.stopPropagation()">
        <div class="py-1" role="menu" aria-orientation="vertical">
          @for (item of items(); track $index) {
            @if (item.isSeparator) {
              <div class="my-1 h-px bg-gray-200 dark:bg-gray-600"></div>
            } @else {
              <button (click)="onItemClick(item.action!)"
                      [class.text-red-600]="item.isDanger"
                      [class.dark:text-red-400]="item.isDanger"
                      [class.hover:bg-red-50]="item.isDanger"
                      [class.dark:hover:bg-red-900/20]="item.isDanger"
                      [class.text-gray-700]="!item.isDanger"
                      [class.dark:text-gray-200]="!item.isDanger"
                      [class.hover:bg-gray-100]="!item.isDanger"
                      [class.dark:hover:bg-gray-600]="!item.isDanger"
                      class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm transition-colors" 
                      role="menuitem">
                {{ item.label }}
              </button>
            }
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuComponent {
  isOpen = input.required<boolean>();
  items = input.required<MenuItem[]>();
  triggerElement = input.required<HTMLElement | undefined>();
  
  close = output<void>();
  itemClicked = output<string>();

  private menuElementRef = viewChild<ElementRef<HTMLDivElement>>('menuElement');
  position = { top: 0, left: 0 };
  isVisible = false;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        // Gunakan timeout agar elemen dirender sebelum dihitung posisinya
        setTimeout(() => this.calculatePosition(), 0);
      } else {
        this.isVisible = false;
      }
    });
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const menuEl = this.menuElementRef()?.nativeElement;
    // Jika menu tidak terbuka atau elemen belum ada, jangan lakukan apa-apa.
    if (!this.isOpen() || !menuEl) {
      return;
    }
    
    const triggerEl = this.triggerElement();

    // Periksa apakah klik terjadi di luar elemen pemicu DAN di luar elemen menu.
    const isClickOutsideTrigger = triggerEl ? !triggerEl.contains(event.target as Node) : true;
    const isClickOutsideMenu = !menuEl.contains(event.target as Node);

    if (isClickOutsideTrigger && isClickOutsideMenu) {
      this.close.emit();
    }
  }

  onItemClick(action: string): void {
    this.itemClicked.emit(action);
    this.close.emit(); 
  }

  private calculatePosition(): void {
    const trigger = this.triggerElement();
    const menu = this.menuElementRef()?.nativeElement;

    if (!trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 8; // Jarak dari trigger

    let top = triggerRect.bottom + margin;
    let left = triggerRect.right - menuRect.width;

    // Cek jika menu keluar dari bawah layar, jika iya, letakkan di atas
    if (top + menuRect.height > viewportHeight) {
      top = triggerRect.top - menuRect.height - margin;
    }

    // Cek jika menu keluar dari kiri layar
    if (left < margin) {
      left = margin;
    }
    
    // Cek jika menu keluar dari kanan layar
    if (left + menuRect.width > viewportWidth - margin) {
        left = viewportWidth - menuRect.width - margin;
    }

    this.position = { top, left };
    this.isVisible = true; // Tampilkan setelah posisi dihitung
  }
}
