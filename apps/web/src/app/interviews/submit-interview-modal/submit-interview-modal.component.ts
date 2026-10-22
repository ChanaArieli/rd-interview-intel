import { Component, Output, EventEmitter, Input, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { InterviewsService } from '../interviews.service';
import { CompanySummaryDto, ROLE_CATEGORIES, SENIORITY_LEVELS, INTERVIEW_STAGES } from '@rd-intel/shared';

@Component({
  selector: 'app-submit-interview-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="isOpen()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold">תרום שאלה</h2>
          <button (click)="close()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
          <!-- Company Selection (Required) -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              חברה
              <span class="text-red-600">*</span>
            </label>
            <div class="relative">
              <input
                type="text"
                formControlName="companyName"
                placeholder="הקלד שם חברה (חברות קיימות מוצעות בהשלמה אוטומטית)..."
                class="w-full border rounded px-3 py-2"
                (input)="onCompanyInputChange($event)"
                autocomplete="off">
              <div *ngIf="filteredCompanies().length > 0 && showCompanyDropdown()" class="absolute top-full left-0 right-0 border border-t-0 rounded-b bg-white z-10 max-h-48 overflow-y-auto shadow-lg">
                <div *ngFor="let company of filteredCompanies()"
                  (click)="selectCompany(company)"
                  class="px-3 py-2 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 text-sm">
                  {{ company.name }}
                  <span class="text-xs text-gray-500" *ngIf="company.questionCount"> ({{ company.questionCount }} שאלות)</span>
                </div>
              </div>
            </div>
            <div *ngIf="form.get('companyName')?.invalid && form.get('companyName')?.touched" class="text-red-500 text-sm mt-1">
              שדה חובה
            </div>
            <p class="text-xs text-gray-500 mt-2">
              💡 אתה יכול להקליד כל שם חברה, גם אם היא לא בהשלמה האוטומטית
            </p>
          </div>

          <!-- Role Category (Optional) -->
          <div>
            <label class="block text-sm font-semibold mb-2">תפקיד</label>
            <select formControlName="roleCategory" class="w-full border rounded px-3 py-2">
              <option value="">בחר תפקיד (אופציונלי)</option>
              <option *ngFor="let role of roleCategories" [value]="role">{{ role }}</option>
            </select>
          </div>

          <!-- Seniority (Optional) -->
          <div>
            <label class="block text-sm font-semibold mb-2">רמת ניסיון</label>
            <select formControlName="seniority" class="w-full border rounded px-3 py-2">
              <option value="">בחר רמה (אופציונלי)</option>
              <option *ngFor="let level of seniorityLevels" [value]="level">{{ level }}</option>
            </select>
          </div>

          <!-- Interview Period (Required) -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              תקופה (לדוגמה: Q4 2026)
              <span class="text-red-600">*</span>
            </label>
            <input type="text" formControlName="interviewPeriod" placeholder="Q4 2026" class="w-full border rounded px-3 py-2">
            <div *ngIf="form.get('interviewPeriod')?.invalid && form.get('interviewPeriod')?.touched" class="text-red-500 text-sm mt-1">
              שדה חובה
            </div>
          </div>

          <!-- Difficulty (Optional) -->
          <div>
            <label class="block text-sm font-semibold mb-2">רמת קושי (1-5, אופציונלי): {{ form.get('difficulty')?.value || 3 }}</label>
            <input type="range" formControlName="difficulty" min="1" max="5" class="w-full">
          </div>

          <!-- Overall Process (Optional) -->
          <div>
            <label class="block text-sm font-semibold mb-2">תיאור התהליך (אופציונלי)</label>
            <textarea formControlName="overallProcess" rows="3" class="w-full border rounded px-3 py-2" placeholder="תיאור כללי של תהליך הראיון..."></textarea>
          </div>

          <!-- Questions -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">שאלות</h3>
              <button type="button" (click)="addQuestion()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                + הוסף שאלה
              </button>
            </div>

            <div formArrayName="questions" class="space-y-4">
              <div *ngFor="let q of questionsArray.controls; let i = index" [formGroupName]="i" class="border rounded p-4 bg-gray-50">
                <div class="flex justify-between items-start mb-3">
                  <h4 class="font-semibold">שאלה {{ i + 1 }}</h4>
                  <button type="button" (click)="removeQuestion(i)" class="text-red-500 hover:text-red-700">✕</button>
                </div>

                <!-- Stage Type (Required) -->
                <div class="mb-3">
                  <label class="block text-sm font-semibold mb-1">
                    סוג שלב
                    <span class="text-red-600">*</span>
                  </label>
                  <select formControlName="stageType" class="w-full border rounded px-3 py-2">
                    <option value="">בחר סוג שלב</option>
                    <option *ngFor="let stage of interviewStages" [value]="stage">{{ stage }}</option>
                  </select>
                  <div *ngIf="getQuestionControl(i, 'stageType')?.invalid && getQuestionControl(i, 'stageType')?.touched" class="text-red-500 text-sm mt-1">
                    שדה חובה
                  </div>
                </div>

                <!-- Question Text (Required) -->
                <div class="mb-3">
                  <label class="block text-sm font-semibold mb-1">
                    טקסט השאלה
                    <span class="text-red-600">*</span>
                  </label>
                  <textarea formControlName="questionText" rows="2" class="w-full border rounded px-3 py-2" placeholder="כתוב את השאלה כאן..."></textarea>
                  <div *ngIf="getQuestionControl(i, 'questionText')?.invalid && getQuestionControl(i, 'questionText')?.touched" class="text-red-500 text-sm mt-1">
                    שדה חובה
                  </div>
                </div>

                <!-- Follow-ups (Optional) -->
                <div class="mb-3">
                  <label class="block text-sm font-semibold mb-1">המשך שאלות (אופציונלי)</label>
                  <textarea formControlName="followUps" rows="1" class="w-full border rounded px-3 py-2" placeholder="שאלות המשך או הערות נוספות..."></textarea>
                </div>

                <!-- Tips (Optional) -->
                <div class="mb-3">
                  <label class="block text-sm font-semibold mb-1">טיפים (אופציונלי)</label>
                  <textarea formControlName="tips" rows="1" class="w-full border rounded px-3 py-2" placeholder="טיפים לפתרון או כיווני חשיבה..."></textarea>
                </div>

                <!-- Tags (Optional) -->
                <div>
                  <label class="block text-sm font-semibold mb-1">תגיות (הפרד בפסיק, אופציונלי)</label>
                  <input type="text" formControlName="tagsString" placeholder="Distributed Systems, Golang" class="w-full border rounded px-3 py-2">
                </div>
              </div>

              <div *ngIf="questionsArray.length === 0" class="text-center text-gray-500 py-4">
                אין שאלות עדיין. לחץ "הוסף שאלה" כדי להתחיל.
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded p-3 text-red-700">
            {{ error() }}
          </div>

          <!-- Submit Button -->
          <div class="flex gap-3">
            <button type="submit" [disabled]="isSubmitting()" class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded">
              {{ isSubmitting() ? 'שליחה...' : 'שלח' }}
            </button>
            <button type="button" (click)="close()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded">
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class SubmitInterviewModalComponent implements OnInit, OnChanges {
  @Input() companies: CompanySummaryDto[] = [];
  @Output() submitted = new EventEmitter<void>();

  isOpen = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  showCompanyDropdown = signal(false);
  companyName = signal<string>('');
  filteredCompanies = signal<CompanySummaryDto[]>([]);

  form!: FormGroup;
  roleCategories = ROLE_CATEGORIES;
  seniorityLevels = SENIORITY_LEVELS;
  interviewStages = INTERVIEW_STAGES;
  companiesWithQuestions: CompanySummaryDto[] = [];

  constructor(
    private fb: FormBuilder,
    private interviewsService: InterviewsService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.updateCompaniesWithQuestions();
  }

  ngOnChanges() {
    this.updateCompaniesWithQuestions();
  }

  private updateCompaniesWithQuestions() {
    this.companiesWithQuestions = this.companies.filter(c => c.questionCount > 0);
    this.filteredCompanies.set(this.companiesWithQuestions);
  }

  private initForm() {
    this.form = this.fb.group({
      companyName: ['', Validators.required],
      roleCategory: [''],
      seniority: [''],
      interviewPeriod: ['', Validators.required],
      difficulty: [3],
      overallProcess: [''],
      questions: this.fb.array([])
    });
  }

  onCompanyInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.companyName.set(value);
    this.form.get('companyName')?.setValue(value);
    this.onCompanyNameChange();
  }

  onCompanyNameChange() {
    const searchTerm = this.companyName().toLowerCase();

    if (searchTerm.length === 0) {
      this.showCompanyDropdown.set(false);
      this.filteredCompanies.set([]);
    } else {
      this.filteredCompanies.set(
        this.companiesWithQuestions.filter(c =>
          c.name.toLowerCase().includes(searchTerm)
        )
      );
      this.showCompanyDropdown.set(this.filteredCompanies().length > 0);
    }
  }

  selectCompany(company: CompanySummaryDto) {
    this.companyName.set(company.name);
    this.form.get('companyName')?.setValue(company.name);
    this.showCompanyDropdown.set(false);
  }

  clearCompany() {
    this.companyName.set('');
    this.form.get('companyName')?.setValue('');
    this.showCompanyDropdown.set(false);
  }

  get questionsArray() {
    return this.form.get('questions') as FormArray;
  }

  addQuestion() {
    const questionForm = this.fb.group({
      stageType: ['', Validators.required],
      questionText: ['', Validators.required],
      followUps: [''],
      tips: [''],
      tagsString: ['']
    });
    this.questionsArray.push(questionForm);
  }

  removeQuestion(index: number) {
    this.questionsArray.removeAt(index);
  }

  getQuestionControl(index: number, controlName: string) {
    return this.questionsArray.at(index).get(controlName);
  }

  open() {
    this.isOpen.set(true);
    this.error.set(null);
    this.form.reset({ difficulty: 3, companyName: '', roleCategory: '', seniority: '', interviewPeriod: '' });
    this.questionsArray.clear();
    this.companyName.set('');
    this.filteredCompanies.set([]);
    this.showCompanyDropdown.set(false);
  }

  close() {
    this.isOpen.set(false);
  }

  onSubmit() {
    // Validate mandatory fields
    const companyName = this.form.get('companyName')?.value?.trim();
    if (!companyName) {
      this.error.set('אנא הזן שם חברה');
      return;
    }

    if (!this.form.get('interviewPeriod')?.value?.trim()) {
      this.error.set('אנא הזן תקופה (לדוגמה: Q4 2026)');
      return;
    }

    if (this.questionsArray.length === 0) {
      this.error.set('אנא הוסף לפחות שאלה אחת');
      return;
    }

    // Validate questions have required fields
    for (let i = 0; i < this.questionsArray.length; i++) {
      const q = this.questionsArray.at(i);
      if (!q.get('stageType')?.value?.trim()) {
        this.error.set(`שאלה ${i + 1}: אנא בחר סוג שלב`);
        return;
      }
      if (!q.get('questionText')?.value?.trim()) {
        this.error.set(`שאלה ${i + 1}: אנא כתוב את טקסט השאלה`);
        return;
      }
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const questions = formValue.questions.map((q: any) => ({
      stageType: q.stageType,
      questionText: q.questionText,
      followUps: q.followUps || null,
      tips: q.tips || null,
      tags: q.tagsString ? q.tagsString.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0) : []
    }));

    const submission = {
      companyName: companyName,
      roleCategory: formValue.roleCategory || null,
      seniority: formValue.seniority || null,
      interviewPeriod: formValue.interviewPeriod?.trim(),
      difficulty: formValue.difficulty || 3,
      overallProcess: formValue.overallProcess || null,
      questions
    };

    this.interviewsService.submitInterview(submission).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.close();
        this.submitted.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.message || 'שגיאה בשליחה. אנא נסה שוב.');
      }
    });
  }
}
