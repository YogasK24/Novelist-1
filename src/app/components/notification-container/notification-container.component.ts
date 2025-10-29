// src/app/components/notification-container/notification-container.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, INotification, NotificationType } from '../../state/notification.service';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-3">
      @for (notif of notificationService.notifications(); track notif.id) {
        <div 
          [class]="getClasses(notif.type)"
          role="alert">

          <div class="flex items-start">
            <div class="flex-shrink-0 mr-3 mt-0.5">
              @switch (notif.type) {
                @case ('success') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                }
                @case ('error') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                }
                @case ('info') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                }
              }
            </div>
            
            <p class="text-sm font-medium flex-grow">{{ notif.message }}</p>

            <button (click)="notificationService.removeNotification(notif.id)" class="ml-4 -mr-1 -mt-1 p-1 rounded-full opacity-70 hover:opacity-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
        dynamicClasses = 'bg-green-600 border-l-4 border-green-800';
        break;
      case 'error':
        dynamicClasses = 'bg-red-600 border-l-4 border-red-800';
        break;
      case 'info':
        dynamicClasses = 'bg-blue-600 border-l-4 border-blue-800';
        break;
      default:
        dynamicClasses = 'bg-gray-600 border-l-4 border-gray-800';
        break;
    }
    return `${dynamicClasses} ${staticClasses}`;
  }

  close(id: number): void {
    this.notificationService.removeNotification(id);
  }
}
