// src/app/directives/click-outside.directive.ts
import { Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class ClickOutsideDirective {
  /**
   * Event yang dipancarkan ketika klik terjadi di luar elemen host.
   */
  readonly clickOutside = output<void>();

  private readonly elementRef = inject(ElementRef);

  /**
   * Menangani event klik global pada dokumen.
   * @param event Event klik dari mouse.
   */
  public onClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
