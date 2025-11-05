// src/app/components/shared/dropdown-menu/dropdown-menu.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, ElementRef, viewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export interface MenuItem {
  label?: string;
  action?: string;
  isDanger?: boolean;
  isSeparator?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (isOpen()) {
      <div #menuElement
           class="fixed z-50 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg 
                  ring-1 ring-black dark:ring-gray-600 ring-opacity-5
                  transform transition-all duration-100 ease-out origin-top-right
                  focus:outline-none"
           [style.top.px]="position().top"
           [style.left.px]="position().left"
           [style.opacity]="isVisible() ? 1 : 0"
           [style.transform]="isVisible() ? 'scale(1)' : 'scale(0.95)'"
           (click)="$event.stopPropagation()"
           
           (keydown)="handleKeydown($event)"
           tabindex="-1" 
           role="menu">

        <div class="py-1" role="none">
          @for (item of items(); track $index) {
            @if (item.isSeparator) {
              <div class="my-1 h-px bg-gray-200 dark:bg-gray-600" role="separator"></div>
            } @else {
              <button (click)="onItemClick(item.action!)"
                      [class.text-red-600]="item.isDanger"
                      [class.dark:text-red-400]="item.isDanger"
                      [class.hover:bg-red-50]="item.isDanger"
                      [class.dark:hover:bg-red-900/20]="item.isDanger"
                      [class.focus-visible:bg-red-50]="item.isDanger"
                      [class.dark:focus-visible:bg-red-900/20]="item.isDanger"
                      [class.text-gray-700]="!item.isDanger"
                      [class.dark:text-gray-200]="!item.isDanger"
                      [class.hover:bg-gray-100]="!item.isDanger"
                      [class.dark:hover:bg-gray-600]="!item.isDanger"
                      [class.focus-visible:bg-gray-100]="!item.isDanger"
                      [class.dark:focus-visible:bg-gray-600]="!item.isDanger"
                      class="w-full text-left flex items-center gap-3 px-4 py-2 text-sm transition-colors focus:outline-none" 
                      role="menuitem"
                      tabindex="-1">
                @if (item.icon) {
                  <app-icon [name]="item.icon" class="w-5 h-5" 
                            [class.text-red-500]="item.isDanger" [class.dark:text-red-400]="item.isDanger"
                            [class.text-gray-500]="!item.isDanger" [class.dark:text-gray-400]="!item.isDanger" />
                }
                <span>{{ item.label }}</span>
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
  position = signal({ top: 0, left: 0 });
  isVisible = signal(false);

  constructor() {
    effect(() => {
      const menuElRef = this.menuElementRef();
      const isOpen = this.isOpen();

      if (isOpen && menuElRef) {
        // Frame 1: Hitung posisi dan terapkan.
        requestAnimationFrame(() => {
          this.calculatePosition();

          // Frame 2: Setelah posisi diterapkan, buat elemen terlihat untuk memicu animasi.
          requestAnimationFrame(() => {
            this.isVisible.set(true);

            const menuEl = menuElRef.nativeElement;
            const firstButton = menuEl.querySelector('button, a') as HTMLElement;
            if (firstButton) {
              firstButton.focus();
            } else {
              menuEl.focus();
            }
          });
        });
      } else {
        this.isVisible.set(false);
      }
    });
  }

  onItemClick(action: string): void {
    this.itemClicked.emit(action);
    this.close.emit();
    this.triggerElement()?.focus();
  }

  private calculatePosition(): void {
    const trigger = this.triggerElement();
    const menu = this.menuElementRef()?.nativeElement;

    if (!trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();
    
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 8;

    let top = triggerRect.bottom + margin;
    
    if (top + menuHeight > viewportHeight - margin) {
      top = triggerRect.top - menuHeight - margin;
    }

    let left = triggerRect.right - menuWidth;

    if (left < margin) {
      left = margin;
    }
    
    if (left + menuWidth > viewportWidth - margin) {
        left = viewportWidth - menuWidth - margin;
    }

    this.position.set({ top, left });
    // JANGAN atur isVisible di sini untuk mencegah race condition.
  }
  
  handleKeydown(event: KeyboardEvent): void {
    const menuEl = this.menuElementRef()?.nativeElement;
    if (!menuEl) return;
    
    const items = Array.from(
      menuEl.querySelectorAll('button, a')
    ) as HTMLElement[];
    if (items.length === 0) return;
    
    switch (event.key) {
      case 'Escape':
      case 'Tab': 
        event.preventDefault();
        event.stopPropagation();
        this.close.emit();
        this.triggerElement()?.focus();
        break;
        
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        const currentIndex = items.indexOf(document.activeElement as HTMLElement);
        let nextIndex = 0;
        
        if (event.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % items.length;
        } else {
          nextIndex = (currentIndex - 1 + items.length) % items.length;
        }
        items[nextIndex].focus();
        break;
        
      case 'Home':
        event.preventDefault();
        items[0].focus();
        break;
        
      case 'End':
        event.preventDefault();
        items[items.length - 1].focus();
        break;
    }
  }
}