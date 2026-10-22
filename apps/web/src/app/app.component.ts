import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow cursor-pointer" (click)="goHome()">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <h1 class="text-3xl font-bold text-gray-900">
            R&D Interview Intelligence
          </h1>
          <p class="text-gray-600 mt-1">Hebrew RTL Technical Interview Platform</p>
        </div>
      </header>

      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/companies']);
  }
}
