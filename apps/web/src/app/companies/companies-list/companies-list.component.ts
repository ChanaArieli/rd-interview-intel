import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompaniesService } from '../companies.service';
import { SubmitInterviewModalComponent } from '../../interviews/submit-interview-modal/submit-interview-modal.component';
import { CompanySummaryDto } from '@rd-intel/shared';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, SubmitInterviewModalComponent],
  template: `
    <app-submit-interview-modal
      #submitModal
      [companies]="companiesWithQuestions()"
      (submitted)="onSubmitSuccess()">
    </app-submit-interview-modal>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header with Button -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">חברות ראיונות</h1>
        <button (click)="openSubmitModal()" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded">
          תרום שאלה
        </button>
      </div>
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="text-center py-12">
        <div class="inline-block">
          <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <p class="text-gray-600 mt-4">טוען חברות...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700 font-semibold">שגיאה בטעינת הנתונים</p>
        <p class="text-red-600 text-sm mt-1">{{ error() }}</p>
      </div>

      <!-- Companies Grid (only show companies with questions) -->
      <div *ngIf="!isLoading() && !error() && companiesWithQuestions().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let company of companiesWithQuestions()" class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ company.name }}</h3>
              <p class="text-gray-600 text-sm" *ngIf="company.industry">{{ company.industry }}</p>
            </div>
          </div>

          <div class="border-t pt-4 mt-4">
            <div class="grid grid-cols-2 gap-4 text-center mb-4">
              <div class="bg-blue-50 rounded p-3">
                <p class="text-2xl font-bold text-blue-600">{{ company.reportCount }}</p>
                <p class="text-xs text-gray-600">דוחות ראיון</p>
              </div>
              <div class="bg-green-50 rounded p-3">
                <p class="text-2xl font-bold text-green-600">{{ company.questionCount }}</p>
                <p class="text-xs text-gray-600">שאלות</p>
              </div>
            </div>

            <!-- Stage Types -->
            <div *ngIf="company.stageTypes.length > 0" class="mb-3">
              <p class="text-xs font-semibold text-gray-700 mb-2">סוגי שלבים:</p>
              <div class="flex flex-wrap gap-1">
                <span *ngFor="let stage of company.stageTypes" class="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {{ stage }}
                </span>
              </div>
            </div>

            <!-- Tags -->
            <div *ngIf="company.tags.length > 0" class="mb-3">
              <p class="text-xs font-semibold text-gray-700 mb-2">תגיות טכניות:</p>
              <div class="flex flex-wrap gap-1">
                <span *ngFor="let tag of company.tags.slice(0, 5)" class="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                  {{ tag }}
                </span>
                <span *ngIf="company.tags.length > 5" class="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{{ company.tags.length - 5 }}
                </span>
              </div>
            </div>

            <!-- Action Button -->
            <button (click)="viewCompanyDetails(company.slug)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
              צפה בפרטים
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && !error() && companiesWithQuestions().length === 0" class="text-center py-12 bg-white rounded-lg">
        <p class="text-gray-600 text-lg">אין חברות עם שאלות ראיונות עדיין</p>
      </div>
    </div>
  `,
  styles: []
})
export class CompaniesListComponent implements OnInit {
  @ViewChild('submitModal') submitModal?: SubmitInterviewModalComponent;

  companies = signal<CompanySummaryDto[]>([]);
  companiesWithQuestions = signal<CompanySummaryDto[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(private companiesService: CompaniesService, private router: Router) {}

  ngOnInit() {
    this.loadCompanies();
  }

  openSubmitModal() {
    this.submitModal?.open();
  }

  onSubmitSuccess() {
    this.loadCompanies();
  }

  viewCompanyDetails(slug: string) {
    this.router.navigate(['/companies', slug]);
  }

  private loadCompanies() {
    this.isLoading.set(true);
    this.error.set(null);

    this.companiesService.getAll().subscribe({
      next: (data) => {
        this.companies.set(data);
        this.companiesWithQuestions.set(data.filter(c => c.questionCount > 0));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load companies');
        this.isLoading.set(false);
      }
    });
  }
}
