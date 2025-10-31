// FIX: Implemented the root AppComponent to provide the main application shell.
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from './app/components/notification-container/notification-container.component';
import { ThemeService } from './app/state/theme.service';
import { GlobalSearchResultsComponent } from './app/components/shared/global-search-results/global-search-results.component';
import { ConfirmationModalComponent } from './app/components/shared/confirmation-modal/confirmation-modal.component';
import { SettingsModalComponent } from './app/components/shared/settings-modal/settings-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NotificationContainerComponent,
    GlobalSearchResultsComponent,
    ConfirmationModalComponent,
    SettingsModalComponent
  ],
  template: `
    <router-outlet></router-outlet>
    <app-notification-container></app-notification-container>
    <app-global-search-results></app-global-search-results>
    <app-confirmation-modal></app-confirmation-modal>
    <app-settings-modal></app-settings-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Inject the theme service to initialize it application-wide
  private readonly themeService = inject(ThemeService);
}