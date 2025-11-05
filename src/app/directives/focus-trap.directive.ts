// src/app/directives/focus-trap.directive.ts
import { Directive, ElementRef, AfterViewInit, OnDestroy, inject, input } from '@angular/core';

@Directive({
  selector: '[appFocusTrap]',
  standalone: true,
})
export class FocusTrapDirective implements AfterViewInit, OnDestroy {
  // Input to enable/disable the trap, useful for conditional logic if needed.
  appFocusTrap = input(true);

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  
  // Store the listener function to be able to remove it later.
  private readonly keydownListener = (e: KeyboardEvent) => this.handleKeydown(e);

  ngAfterViewInit(): void {
    if (this.appFocusTrap()) {
      // Delay trapping focus to ensure all content inside the modal is rendered.
      requestAnimationFrame(() => {
        this.trapFocus();
        this.elementRef.nativeElement.addEventListener('keydown', this.keydownListener);
      });
    }
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener('keydown', this.keydownListener);
  }

  private trapFocus(): void {
    // FIX: Removed the incorrect generic type argument `<HTMLElement>` from `querySelectorAll` as it is not a generic method.
    const focusableNodeList = this.elementRef.nativeElement.querySelectorAll(
      'a[href]:not([tabindex="-1"]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    // FIX: Add a type assertion to ensure TypeScript correctly infers the array type as HTMLElement[].
    // This resolves errors where array elements were being inferred as 'unknown' or '{}'.
    const focusableElements = Array.from(focusableNodeList) as HTMLElement[];

    if (focusableElements.length === 0) {
      this.elementRef.nativeElement.setAttribute('tabindex', '-1');
      this.firstFocusableElement = this.elementRef.nativeElement;
      this.lastFocusableElement = this.elementRef.nativeElement;
    } else {
      this.firstFocusableElement = focusableElements[0];
      this.lastFocusableElement = focusableElements[focusableElements.length - 1];
    }
    
    this.firstFocusableElement?.focus();
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab' || !this.firstFocusableElement || !this.lastFocusableElement) {
      return;
    }

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  }
}
