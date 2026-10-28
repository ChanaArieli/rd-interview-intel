import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompaniesService } from '../companies.service';
import { InterviewsService } from '../../interviews/interviews.service';
import { AuthService } from '../../auth/auth.service';
import {
  CompanyDetailDto,
  InterviewQuestionDto,
  UpdateInterviewQuestionDto
} from '@rd-intel/shared';

interface EditForm {
  stageType: string;
  questionText: string;
  followUps: string;
  tips: string;
  tags: string;
}

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
                <div class="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-200">
                  <span>שאלה {{ j + 1 }} / {{ report.questions.length }}</span>

                  <!-- Action buttons -->
                  <div class="flex items-center gap-2" *ngIf="editingId() !== question.id">
                    <button
                      *ngIf="auth.isLoggedIn()"
                      (click)="startEdit(question)"
                      class="px-2 py-1 text-blue-700 border border-blue-300 rounded hover:bg-blue-50">
                      ערוך
                    </button>
                    <button
                      *ngIf="auth.isAdmin()"
                      (click)="deleteQuestion(report, question.id)"
                      class="px-2 py-1 text-red-700 border border-red-300 rounded hover:bg-red-50">
                      מחק
                    </button>
                  </div>
                </div>

                <!-- Per-question error (e.g. 403 on edit) -->
                <div *ngIf="actionError()[question.id]" class="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {{ actionError()[question.id] }}
                </div>

                <!-- EDIT MODE -->
                <div *ngIf="editingId() === question.id" class="space-y-3">
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">סוג שלב</label>
                    <input [(ngModel)]="editForm.stageType" class="w-full border rounded px-3 py-2 text-sm">
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">השאלה</label>
                    <textarea [(ngModel)]="editForm.questionText" rows="3" class="w-full border rounded px-3 py-2 text-sm"></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">המשך</label>
                    <textarea [(ngModel)]="editForm.followUps" rows="2" class="w-full border rounded px-3 py-2 text-sm"></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">טיפים</label>
                    <textarea [(ngModel)]="editForm.tips" rows="2" class="w-full border rounded px-3 py-2 text-sm"></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">תגיות (מופרדות בפסיק)</label>
                    <input [(ngModel)]="editForm.tags" class="w-full border rounded px-3 py-2 text-sm">
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      (click)="saveEdit(report, question)"
                      [disabled]="isSaving()"
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm">
                      {{ isSaving() ? 'שומר...' : 'שמור' }}
                    </button>
                    <button
                      (click)="cancelEdit()"
                      class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm">
                      ביטול
                    </button>
                  </div>
                </div>

                <!-- READ MODE -->
                <ng-container *ngIf="editingId() !== question.id">
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
                </ng-container>
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

  editingId = signal<string | null>(null);
  isSaving = signal(false);
  actionError = signal<Record<string, string>>({});
  editForm: EditForm = { stageType: '', questionText: '', followUps: '', tips: '', tags: '' };

  private slug: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companiesService: CompaniesService,
    private interviewsService: InterviewsService,
    public auth: AuthService
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

  // --- Edit ---

  startEdit(question: InterviewQuestionDto) {
    this.clearActionError(question.id);
    this.editForm = {
      stageType: question.stageType,
      questionText: question.questionText,
      followUps: question.followUps ?? '',
      tips: question.tips ?? '',
      tags: question.tags.join(', ')
    };
    this.editingId.set(question.id);
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  saveEdit(report: { questions: InterviewQuestionDto[] }, question: InterviewQuestionDto) {
    const payload: UpdateInterviewQuestionDto = {
      stageType: this.editForm.stageType.trim(),
      questionText: this.editForm.questionText.trim(),
      followUps: this.editForm.followUps.trim() || null,
      tips: this.editForm.tips.trim() || null,
      tags: this.editForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
    };

    this.isSaving.set(true);
    this.interviewsService.updateQuestion(question.id, payload).subscribe({
      next: (updated) => {
        this.applyQuestionUpdate(report, updated);
        this.isSaving.set(false);
        this.editingId.set(null);
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg =
          err?.status === 403
            ? 'לא ניתן לערוך שאלה זו (רק מי שהוסיף אותה יכול לערוך)'
            : 'עריכת השאלה נכשלה';
        this.setActionError(question.id, msg);
      }
    });
  }

  // --- Delete (admin) ---

  deleteQuestion(report: { questions: InterviewQuestionDto[] }, questionId: string) {
    if (!confirm('למחוק את השאלה לצמיתות?')) return;

    this.interviewsService.deleteQuestion(questionId).subscribe({
      next: () => this.removeQuestion(report, questionId),
      error: (err) => {
        const msg =
          err?.status === 403 ? 'אין לך הרשאת מנהל למחיקה' : 'מחיקת השאלה נכשלה';
        this.setActionError(questionId, msg);
      }
    });
  }

  // --- Local signal mutation helpers ---

  private applyQuestionUpdate(
    report: { questions: InterviewQuestionDto[] },
    updated: InterviewQuestionDto
  ) {
    const idx = report.questions.findIndex(q => q.id === updated.id);
    if (idx !== -1) {
      report.questions[idx] = { ...report.questions[idx], ...updated };
      // Re-emit the signal so change detection picks up the mutation.
      this.company.set(this.company() ? { ...this.company()! } : null);
    }
  }

  private removeQuestion(
    report: { questions: InterviewQuestionDto[] },
    questionId: string
  ) {
    const idx = report.questions.findIndex(q => q.id === questionId);
    if (idx !== -1) {
      report.questions.splice(idx, 1);
      const current = this.company();
      if (current) {
        this.company.set({ ...current, questionCount: Math.max(0, current.questionCount - 1) });
      }
    }
  }

  private setActionError(questionId: string, message: string) {
    this.actionError.set({ ...this.actionError(), [questionId]: message });
  }

  private clearActionError(questionId: string) {
    const next = { ...this.actionError() };
    delete next[questionId];
    this.actionError.set(next);
  }
}
