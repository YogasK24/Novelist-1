// src/app/components/shared/dropdown-menu/dropdown-menu.component.ts
import { Component, ChangeDetectionStrategy, input, output, effect, ElementRef, viewChild, signal, inject, Renderer2, OnDestroy } from '@angular/core';
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
                  transform transition-all duration-100 ease-out"
           [style.top.px]="position.top"
           [style.left.px]="position.left"
           [style.opacity]="isVisible() ? 1 : 0"
           [style.transform]="isVisible() ? 'scale(1)' : 'scale(0.95)'"
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
export class DropdownMenuComponent implements OnDestroy {
  isOpen = input.required<boolean>();
  items = input.required<MenuItem[]>();
  triggerElement = input.required<HTMLElement | undefined>();
  
  close = output<void>();
  itemClicked = output<string>();

  private menuElementRef = viewChild<ElementRef<HTMLDivElement>>('menuElement');
  position = { top: 0, left: 0 };
  isVisible = signal(false);
  private renderer = inject(Renderer2);
  private unlisten: (() => void) | null = null;
  
  constructor() {
    effect((onCleanup) => {
      if (this.isOpen()) {
        // Delay attaching the listener to avoid the same click event that opened the menu
        // from immediately closing it.
        const timerId = setTimeout(() => {
          this.calculatePosition();
          // Ensure we don't attach multiple listeners.
          if (!this.unlisten) {
            this.unlisten = this.renderer.listen('document', 'click', this.handleGlobalClick);
          }
        }, 0);
        
        onCleanup(() => {
            clearTimeout(timerId);
        });

      } else {
        this.isVisible.set(false);
        this.removeGlobalListener();
      }
    });
  }

  ngOnDestroy(): void {
    this.removeGlobalListener();
  }

  private removeGlobalListener(): void {
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }
  }
  
  // Using an arrow function to preserve the `this` context for the listener
  private handleGlobalClick = (event: MouseEvent): void => {
    const trigger = this.triggerElement();
    const menu = this.menuElementRef()?.nativeElement;

    // If the click is outside the trigger AND outside the menu, it's a "click outside"
    if (trigger && !trigger.contains(event.target as Node) && menu && !menu.contains(event.target as Node)) {
      this.close.emit();
    }
  };

  onItemClick(action: string): void {
    this.itemClicked.emit(action);
    this.close.emit(); 
  }

  private calculatePosition(): void {
    const trigger = this.triggerElement();
    const menu = this.menuElementRef()?.nativeElement;

    if (!trigger || !menu) return;

    // Get the position of the trigger element relative to the viewport.
    const triggerRect = trigger.getBoundingClientRect();
    
    // Get the dimensions of the menu itself.
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    
    // Define screen boundaries and a small margin.
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 8;

    // --- POSITIONING LOGIC ---

    // Default position: Below the trigger, with their right edges aligned.
    let top = triggerRect.bottom + margin;
    let left = triggerRect.right - menuWidth;

    // 1. Vertical Collision: Check if the menu overflows the bottom of the viewport.
    if (top + menuHeight > viewportHeight - margin) {
      // If it overflows, flip it to appear *above* the trigger.
      top = triggerRect.top - menuHeight - margin;
    }

    // 2. Top Collision: After potentially flipping, ensure it doesn't overflow the top.
    if (top < margin) {
      top = margin;
    }

    // 3. Horizontal Collision: Ensure the menu doesn't overflow the left or right edges.
    if (left < margin) {
      left = margin; // Prevent left overflow.
    }
    if (left + menuWidth > viewportWidth - margin) {
      left = viewportWidth - menuWidth - margin; // Prevent right overflow.
    }

    // Apply the calculated position.
    this.position = { top, left };
    // Set visibility to true to trigger the show animation.
    this.isVisible.set(true);
  }
}
