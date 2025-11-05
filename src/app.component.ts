// FIX: Implemented the root AppComponent to provide the main application shell.
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from './app/components/notification-container/notification-container.component';
import { ThemeService } from './app/state/theme.service';
import { ConfirmationModalComponent } from './app/components/shared/confirmation-modal/confirmation-modal.component';
import { SettingsModalComponent } from './app/components/shared/settings-modal/settings-modal.component';
import { StatisticsDashboardModalComponent } from './app/components/statistics/statistics-dashboard-modal/statistics-dashboard-modal.component';
import { HelpModalComponent } from './app/components/dashboard/help-modal/help-modal.component';
import { UiStateService } from './app/state/ui-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NotificationContainerComponent,
    ConfirmationModalComponent,
    SettingsModalComponent,
    StatisticsDashboardModalComponent,
    HelpModalComponent
  ],
  template: `
    <router-outlet></router-outlet>
    <app-notification-container></app-notification-container>
    <app-confirmation-modal></app-confirmation-modal>
    <app-settings-modal></app-settings-modal>
    <app-statistics-dashboard-modal></app-statistics-dashboard-modal>

    @if (uiState.isHelpModalOpen()) {
      <app-help-modal
        [show]="uiState.isHelpModalOpen()"
        [context]="uiState.helpModalContext()!"
        (closeModal)="uiState.closeHelpModal()">
      </app-help-modal>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Inject the theme service to initialize it application-wide
  private readonly themeService = inject(ThemeService);
  public readonly uiState = inject(UiStateService);
}