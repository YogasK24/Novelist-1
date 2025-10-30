// FIX: Implemented the root AppComponent to provide the main application shell.
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from './app/components/notification-container/notification-container.component';
import { ThemeService } from './app/state/theme.service';
import { GlobalSearchResultsComponent } from './app/components/shared/global-search-results/global-search-results.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NotificationContainerComponent,
    GlobalSearchResultsComponent
  ],
  template: `
    <router-outlet></router-outlet>
    <app-notification-container></app-notification-container>
    <app-global-search-results></app-global-search-results>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Inject the theme service to initialize it application-wide
  private readonly themeService = inject(ThemeService);
}
