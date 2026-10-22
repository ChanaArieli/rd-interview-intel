import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompaniesService } from '../companies.service';
import { CompanyDetailDto } from '@rd-intel/shared';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Back Button -->
      <button (click)="goBack()" class="mb-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2">
        <span>← חזור לחברות</span>
      </button>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="text-center py-12">
        <div class="inline-block">
          <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <p class="text-gray-600 mt-4">טוען פרטים...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700 font-semibold">שגיאה בטעינת הנתונים</p>
        <p class="text-red-600 text-sm mt-1">{{ error() }}</p>
      </div>

      <!-- Company Header -->
      <div *ngIf="!isLoading() && !error() && company()" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-4xl font-bold text-gray-900">{{ company()?.name }}</h1>
            <p class="text-gray-600 text-lg mt-1" *ngIf="company()?.industry">{{ company()?.industry }}</p>
          </div>
        </div>

        <div *ngIf="company()" class="grid grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded p-4">
            <p class="text-3xl font-bold text-blue-600">{{ company()!.reportCount }}</p>
            <p class="text-sm text-gray-600">דוחות ראיון</p>
          </div>
          <div class="bg-green-50 rounded p-4">
            <p class="text-3xl font-bold text-green-600">{{ company()!.questionCount }}</p>
            <p class="text-sm text-gray-600">שאלות</p>
          </div>
          <div class="bg-purple-50 rounded p-4">
            <p class="text-3xl font-bold text-purple-600">{{ company()!.stageTypes.length }}</p>
            <p class="text-sm text-gray-600">סוגי שלבים</p>
          </div>
        </div>

        <!-- Tags -->
        <div *ngIf="company() && company()!.tags.length" class="mt-4">
          <p class="text-sm font-semibold text-gray-700 mb-2">תגיות טכניות:</p>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let tag of company()!.tags" class="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Questions Section -->
      <div *ngIf="!isLoading() && !error() && company()" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold mb-6">שאלות אמיתיות מראיונות עבודה</h2>

        <div *ngIf="company() && company()!.reports.length === 0" class="text-center py-8">
          <p class="text-gray-600">אין שאלות עדיין</p>
        </div>

        <div *ngFor="let report of company()?.reports; let i = index" class="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <!-- Report Header -->
          <div class="mb-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div *ngIf="report.roleCategory">
                <p class="text-gray-600">תפקיד</p>
                <p class="font-semibold text-gray-900">{{ report.roleCategory }}</p>
              </div>
              <div *ngIf="report.seniority">
                <p class="text-gray-600">רמה</p>
                <p class="font-semibold text-gray-900">{{ report.seniority }}</p>
              </div>
              <div>
                <p class="text-gray-600">תקופה</p>
                <p class="font-semibold text-gray-900">{{ report.interviewPeriod }}</p>
              </div>
              <div>
                <p class="text-gray-600">קושי</p>
                <p class="font-semibold text-gray-900">{{ report.difficulty }}/5</p>
              </div>
            </div>
          </div>

          <!-- Overall Process -->
          <div *ngIf="report.overallProcess" class="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p class="text-sm font-semibold text-gray-700 mb-1">תיאור התהליך:</p>
            <p class="text-gray-700 text-sm">{{ report.overallProcess }}</p>
          </div>

          <!-- Questions in this Report -->
          <div class="space-y-3">
            <div *ngFor="let question of report.questions; let j = index" class="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <!-- Question Header (Collapsible) -->
              <div
                (click)="toggleQuestion(question.id)"
                class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 cursor-pointer flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 transition-colors">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded flex-shrink-0">
                    {{ question.stageType }}
                  </span>
                  <p class="text-sm font-semibold text-gray-900 truncate">{{ question.questionText }}</p>
                </div>
                <span class="text-lg text-blue-600 transition-transform" [class.rotate-180]="isQuestionExpanded(question.id)">
                  ▼
                </span>
              </div>

              <!-- Question Details (Expandable) -->
              <div *ngIf="isQuestionExpanded(question.id)" class="bg-white p-4 border-t-2 border-gray-300 space-y-3">
                <div class="text-xs text-gray-500 pb-2 border-b border-gray-200">
                  שאלה {{ j + 1 }} / {{ report.questions.length }}
                </div>

                <div class="bg-blue-50 p-3 rounded border border-blue-200">
                  <p class="font-semibold text-blue-900 text-sm mb-2">השאלה:</p>
                  <p class="text-gray-800 text-sm leading-relaxed">{{ question.questionText }}</p>
                </div>

                <div *ngIf="question.followUps" class="p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p class="font-semibold text-yellow-900 text-sm mb-1">המשך:</p>
                  <p class="text-gray-700 text-sm">{{ question.followUps }}</p>
                </div>

                <div *ngIf="question.tips" class="p-3 bg-green-50 rounded border border-green-200">
                  <p class="font-semibold text-green-900 text-sm mb-1">טיפים:</p>
                  <p class="text-gray-700 text-sm">{{ question.tips }}</p>
                </div>

                <div *ngIf="question.tags.length" class="pt-2 border-t border-gray-200">
                  <p class="text-xs font-semibold text-gray-600 mb-2">תגיות:</p>
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let tag of question.tags" class="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CompanyDetailComponent implements OnInit {
  company = signal<CompanyDetailDto | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  expandedQuestions = signal<Set<string>>(new Set());
  private slug: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companiesService: CompaniesService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      this.loadCompanyDetail();
    });
  }

  private loadCompanyDetail() {
    this.isLoading.set(true);
    this.error.set(null);

    this.companiesService.getBySlug(this.slug).subscribe({
      next: (data) => {
        this.company.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load company details');
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/companies']);
  }

  toggleQuestion(questionId: string) {
    const expanded = new Set(this.expandedQuestions());
    if (expanded.has(questionId)) {
      expanded.delete(questionId);
    } else {
      expanded.add(questionId);
    }
    this.expandedQuestions.set(expanded);
  }

  isQuestionExpanded(questionId: string): boolean {
    return this.expandedQuestions().has(questionId);
  }
}
