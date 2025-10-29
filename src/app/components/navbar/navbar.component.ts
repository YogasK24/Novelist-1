// src/app/components/navbar/navbar.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router'; // Import RouterLink

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink], // Impor RouterLink
  template: `
    <nav class="bg-gray-800 shadow-md sticky top-0 z-40">
      <div class="container mx-auto px-4 py-3">
        <!-- Gunakan [routerLink] -->
        <a [routerLink]="['/']" class="text-xl font-bold text-white hover:text-gray-300 transition duration-150">
          Novelist App (Angular)
        </a>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {}
