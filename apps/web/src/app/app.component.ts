import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo & Navigation -->
            <div class="flex items-center gap-8">
              <a routerLink="/companies" class="flex items-center gap-2" aria-label="Home">
                <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span class="text-xl font-bold text-gray-900">R&D Interview Intel</span>
              </a>

              <!-- Desktop Navigation -->
              <nav class="hidden md:flex items-center gap-6" *ngIf="auth.isLoggedIn()">
                <a routerLink="/companies" routerLinkActive="text-indigo-600" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Companies
                </a>
                <a routerLink="/submit" routerLinkActive="text-indigo-600" class="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Submit Interview
                </a>
              </nav>
            </div>

            <!-- Right side: User menu or Auth buttons -->
            <div class="flex items-center gap-4">
              @if (auth.isLoggedIn()) {
                <!-- User Menu -->
                <div class="relative">
                  <button
                    (click)="toggleUserMenu()"
                    [attr.aria-expanded]="userMenuOpen"
                    [attr.aria-haspopup]="true"
                    class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <div class="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                      {{ getInitials() }}
                    </div>
                    <span class="hidden sm:block">{{ auth.currentUser()?.name || auth.currentUser()?.email }}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Dropdown Menu -->
                  @if (userMenuOpen) {
                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div class="px-4 py-2 border-b border-gray-100">
                        <p class="text-sm font-medium text-gray-900">{{ auth.currentUser()?.name || 'User' }}</p>
                        <p class="text-sm text-gray-500 truncate">{{ auth.currentUser()?.email }}</p>
                        @if (auth.isAdmin()) {
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">Admin</span>
                        }
                      </div>
                      <button
                        (click)="logout()"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <!-- Auth Buttons -->
                <div class="flex items-center gap-2">
                  <a routerLink="/login" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sign in
                  </a>
                  <a routerLink="/signup" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Get started
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile User Menu Overlay -->
      @if (userMenuOpen) {
        <div class="fixed inset-0 z-40 bg-black bg-opacity-20 md:hidden" (click)="closeUserMenu()" aria-hidden="true"></div>
      }

      <!-- Main Content -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p class="text-center text-sm text-gray-500">
            R&D Interview Intelligence &mdash; Israeli Tech Interview Insights
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class AppComponent {
  userMenuOpen = false;

  constructor(private router: Router, public auth: AuthService) {}

  getInitials(): string {
    const user = this.auth.currentUser();
    if (!user) return '?';
    const name = user.name || user.email;
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.userMenuOpen = false;
    this.router.navigate(['/login']);
  }
}
