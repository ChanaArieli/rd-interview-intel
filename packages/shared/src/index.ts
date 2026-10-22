// User DTOs
export interface UserProfileDto {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  roleCategory: string | null;
  seniority: string | null;
  credits: number;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Company DTOs
export interface CompanySummaryDto {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  reportCount: number;
  questionCount: number;
  stageTypes: string[];
  tags: string[];
  createdAt: Date;
}

export interface CompanyDetailDto extends CompanySummaryDto {
  reports: InterviewReportDto[];
}

// Interview Report DTOs
export interface InterviewReportDto {
  id: string;
  companyId: string;
  roleCategory: string;
  seniority: string;
  interviewPeriod: string;
  overallProcess: string | null;
  difficulty: number;
  createdAt: Date;
  questions: InterviewQuestionDto[];
}

// Interview Question DTOs
export interface InterviewQuestionDto {
  id: string;
  reportId: string;
  stageType: string;
  questionText: string;
  followUps: string | null;
  tips: string | null;
  tags: string[];
  createdAt: Date;
}

// Create/Submission DTOs
export interface CreateInterviewSubmissionDto {
  companyId: string;
  roleCategory: string;
  seniority: string;
  interviewPeriod: string;
  overallProcess: string;
  difficulty: number;
  questions: CreateInterviewQuestionDto[];
}

export interface CreateInterviewQuestionDto {
  stageType: string;
  questionText: string;
  followUps?: string;
  tips?: string;
  tags: string[];
}

// LLM Validation Result
export interface LlmValidationResultDto {
  isValid: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}

// Pagination DTOs
export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Constants
export const ROLE_CATEGORIES = [
  'Backend',
  'Fullstack',
  'Frontend',
  'Data',
  'DevOps',
  'QA'
] as const;

export const SENIORITY_LEVELS = [
  'Junior',
  'Mid',
  'Senior',
  'Staff / Lead'
] as const;

export const INTERVIEW_STAGES = [
  'System Design',
  'Live Coding',
  'Take-Home',
  'Technical Deep Dive',
  'Architecture'
] as const;

export const DIFFICULTY_RANGE = {
  MIN: 1,
  MAX: 5
} as const;

export const CREDIT_VALUES = {
  INITIAL: 1,
  SUBMISSION_REWARD: 3,
  COMPANY_UNLOCK_COST: 1
} as const;
