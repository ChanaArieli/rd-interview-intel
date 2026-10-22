import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompaniesListComponent } from './companies/companies-list/companies-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CompaniesListComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <h1 class="text-3xl font-bold text-gray-900">
            R&D Interview Intelligence
          </h1>
          <p class="text-gray-600 mt-1">Hebrew RTL Technical Interview Platform</p>
        </div>
      </header>

      <main>
        <app-companies-list></app-companies-list>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {}
