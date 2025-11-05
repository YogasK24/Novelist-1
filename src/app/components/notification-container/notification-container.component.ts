// src/app/components/notification-container/notification-container.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, INotification, NotificationType } from '../../state/notification.service';
import { IconComponent } from '../shared/icon/icon.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="fixed top-4 right-4 z-[70] space-y-3" aria-live="polite">
      @for (notif of notificationService.notifications(); track notif.id) {
        <div 
          [class]="getClasses(notif.type)"
          role="alert">

          <div class="flex items-start">
            <div class="flex-shrink-0 mr-3 mt-0.5">
              <app-icon [name]="getIconName(notif.type)" class="w-6 h-6" />
            </div>
            
            <p class="text-sm font-medium flex-grow">{{ notif.message }}</p>

            <button (click)="notificationService.removeNotification(notif.id)" class="ml-4 -mr-1 -mt-1 p-1 rounded-full opacity-70 hover:opacity-100 transition">
              <app-icon name="outline-x-mark-24" class="w-4 h-4" />
            </button>
          </div>

        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationContainerComponent {
  readonly notificationService = inject(NotificationService);

  getClasses(type: NotificationType): string {
    const staticClasses = 'p-4 rounded-lg shadow-xl text-white max-w-xs transition-opacity duration-300 ease-in-out opacity-100';
    let dynamicClasses: string;
    switch (type) {
      case 'success':
        dynamicClasses = 'bg-green-500 border-l-4 border-green-700';
        break;
      case 'error':
        dynamicClasses = 'bg-red-500 border-l-4 border-red-700';
        break;
      case 'info':
        dynamicClasses = 'bg-blue-500 border-l-4 border-blue-700';
        break;
      default:
        dynamicClasses = 'bg-gray-500 border-l-4 border-gray-700';
        break;
    }
    return `${dynamicClasses} ${staticClasses}`;
  }
  
  getIconName(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'outline-check-circle-24';
      case 'error':
        return 'outline-exclamation-circle-24';
      case 'info':
        return 'outline-info-circle-24';
      default:
        return 'outline-info-circle-24';
    }
  }

  close(id: number): void {
    this.notificationService.removeNotification(id);
  }
}
