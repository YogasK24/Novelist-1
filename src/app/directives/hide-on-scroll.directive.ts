// src/app/directives/hide-on-scroll.directive.ts
import { Directive, ElementRef, Input, OnInit, OnDestroy, inject, Renderer2 } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { throttleTime, map, pairwise, distinctUntilChanged, startWith } from 'rxjs/operators';

@Directive({
  selector: '[appHideOnScroll]',
  standalone: true,
})
export class HideOnScrollDirective implements OnInit, OnDestroy {
  @Input('appHideOnScroll') scrollContainer!: HTMLElement;

  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private scrollSubscription: Subscription | undefined;
  private readonly SCROLL_THRESHOLD = 15;

  ngOnInit(): void {
    if (!this.scrollContainer) {
      console.error('HideOnScrollDirective: No scroll container provided.');
      return;
    }

    this.scrollSubscription = fromEvent(this.scrollContainer, 'scroll')
      .pipe(
        throttleTime(50), // Periksa posisi scroll paling sering setiap 50ms
        map(() => this.scrollContainer.scrollTop),
        startWith(0),
        pairwise(), // Dapatkan posisi scroll sebelumnya dan saat ini
        map(([prev, curr]) => {
          // Selalu terlihat di bagian atas
          if (curr <= this.SCROLL_THRESHOLD) {
            return true; // terlihat
          }
          // Periksa apakah perbedaan scroll signifikan
          if (Math.abs(curr - prev) < this.SCROLL_THRESHOLD) {
            return null; // Tidak ada perubahan
          }
          return curr < prev; // terlihat jika menggulir ke atas
        }),
        distinctUntilChanged((prev, curr) => curr === null || prev === curr) // Hanya emit pada perubahan aktual
      )
      .subscribe((isVisible) => {
        if (isVisible === true) {
          this.renderer.removeClass(this.elementRef.nativeElement, 'fab-hidden');
        } else if (isVisible === false) {
          this.renderer.addClass(this.elementRef.nativeElement, 'fab-hidden');
        }
      });
  }

  ngOnDestroy(): void {
    this.scrollSubscription?.unsubscribe();
  }
}
