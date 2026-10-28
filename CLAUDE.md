# R&D Interview Intelligence & Engineering Culture Platform

## Project Vision
Israeli tech company interview intelligence and engineering culture platform — a technical, developer-focused alternative to Glassdoor.

## Monorepo Architecture

### Structure
```
.
├── apps/
│   ├── api/              # NestJS backend (port 3001, /api global prefix)
│   └── web/              # Angular Standalone (port 4200, RTL Hebrew setup)
├── packages/
│   └── shared/           # Contract-First TypeScript interfaces & DTOs
├── docker-compose.yml    # PostgreSQL 16 (port 5432, db: rd_intel)
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── turbo.json           # Turborepo cache & pipeline
└── CLAUDE.md            # This file
```

### Technology Stack
- **Monorepo**: `pnpm` workspaces + `turbo` (Turborepo)
- **Backend**: NestJS + TypeScript
- **Frontend**: Angular (Standalone Components) + Tailwind CSS + RTL support
- **Database**: PostgreSQL 16 (Docker) + Prisma ORM
- **Shared**: TypeScript interfaces & DTOs (Contract-First)

### CORS & Connectivity
- Backend CORS enabled for `http://localhost:4200`
- Angular HttpClient connects to `http://localhost:3001/api`

---

## Core Domain Rules

### 1. User Signup & Authentication
- **Open Google Signup**: Anyone with a Google account can sign up (future: implement OAuth2 flow)
- New users receive `1` free starter credit upon signup
- New users have `hasCompletedOnboarding: false` by default

### 2. Give-to-Get Credit Economy
- **1 Starter Credit (Signup)**: Every new user gets 1 free credit
- **Unlock Company**: Costs `1` credit per company (permanent unlock for that user)
- **Submit Interview Report**: Valid reports (pass LLM quality gate) reward user with `+3` credits
- **Onboarding Choice**:
  - Submit an interview question during onboarding, OR
  - Click "Skip for now" (sets `hasCompletedOnboarding: true`, retains 1 starter credit)

### 3. Strict Anonymity by Design
- **NO foreign keys on InterviewReport or InterviewQuestion**: Public interview data is completely decoupled from user identity
- **NO userId field on the public models**: Interview submissions are anonymous in all public DTOs/APIs
- **Interview Dates as Quarters**: Store only quarter strings (e.g., `"Q3 2026"`, `"Q4 2026"`)
- **Impact**: Users cannot track who submitted what; pure knowledge base, no social graph
- **Private ownership exception**: To support *owner-only edit*, submissions are linked to their author via a **separate private `QuestionOwnership` table** (`userId` + `questionId`). This table:
  - is **never** exposed in any public DTO or API response (verified: `GET /api/companies/:slug` payloads contain no `userId`),
  - has **no Prisma relation/FK to `InterviewQuestion`** (the `questionId` is stored as a plain string), so the public question model stays fully decoupled from identity,
  - is used **server-side only** to authorize edits. Anonymity of the public knowledge base is preserved; ownership is a private authorization detail, not a social graph.

---

## Prisma Data Model

### User
- `id` (UUID, PK)
- `email` (String, unique)
- `name` (String?)
- `avatarUrl` (String?)
- `googleId` (String?, unique)
- `roleCategory` (String? — "Backend", "Fullstack", "Frontend", "Data", "DevOps", "QA")
- `seniority` (String? — "Junior", "Mid", "Senior", "Staff / Lead")
- `credits` (Int, default: 1)
- `hasCompletedOnboarding` (Boolean, default: false)
- `isAdmin` (Boolean, default: false — admins can delete any interview question)
- `createdAt`, `updatedAt`
- **Relations**: `unlocks CompanyUnlock[]`, `questionOwnerships QuestionOwnership[]`

### Company
- `id` (UUID, PK)
- `name` (String, unique — e.g., "Wiz", "Monday.com", "Wix")
- `slug` (String, unique)
- `industry` (String?)
- `createdAt`
- **Relations**: `reports InterviewReport[]`, `unlockedBy CompanyUnlock[]`

### CompanyUnlock
- `id` (UUID, PK)
- `userId` (String, FK → User)
- `companyId` (String, FK → Company)
- `createdAt`
- **Unique**: `[userId, companyId]` (can't unlock same company twice)

### InterviewReport
- `id` (UUID, PK)
- `companyId` (String, FK → Company)
- `roleCategory` (String — "Backend", "Fullstack", "Frontend", etc.)
- `seniority` (String — "Junior", "Mid", "Senior", "Staff / Lead")
- `interviewPeriod` (String — e.g., "Q4 2026")
- `overallProcess` (String? — Hebrew description of the interview process)
- `difficulty` (Int — 1 to 5)
- `createdAt`
- **Relations**: `company Company`, `questions InterviewQuestion[]`
- **CRITICAL**: NO `userId` field (strict anonymity)

### InterviewQuestion
- `id` (UUID, PK)
- `reportId` (String, FK → InterviewReport, onDelete: Cascade)
- `stageType` (String — "System Design" | "Live Coding" | "Take-Home" | "Technical Deep Dive" | "Architecture")
- `questionText` (String)
- `followUps` (String? — additional context)
- `tips` (String? — hints for candidates)
- `tags` (String[] — e.g., ["Distributed Systems", "Golang", "Performance"])
- `createdAt`
- **CRITICAL**: NO `userId` field (strict anonymity). Ownership for edit authorization lives in `QuestionOwnership` (below), not here.

### QuestionOwnership (private — never exposed publicly)
- `id` (UUID, PK)
- `userId` (String, FK → User)
- `questionId` (String, **unique**, NOT a Prisma relation/FK to InterviewQuestion — stored as plain string to keep the public model anonymity-clean)
- `createdAt`
- **Purpose**: server-side authorization for *owner-only edit* of questions. Created automatically for each question on submission. Never returned in any public DTO/API.

---

## Contract-First Development (`packages/shared`)

### DTOs & Interfaces
- `UserProfileDto` (includes `isAdmin: boolean`)
- `DevLoginDto`, `AuthResponseDto` (dev JWT login; swap-in point for Google OAuth)
- `CompanySummaryDto` (name, slug, industry, reportCount, questionCount, stageTypes[], tags[])
- `CompanyDetailDto` (extends CompanySummaryDto + reports[])
- `InterviewReportDto`
- `InterviewQuestionDto`
- `CreateInterviewSubmissionDto`
- `UpdateInterviewQuestionDto` (all fields optional — owner-only edit)
- `LlmValidationResultDto`

---

## Seeded Companies (12 Total)
Israeli tech companies to seed:
1. Wiz (Cybersecurity) — with 2 sample interview reports
2. Monday.com (Work OS) — with 1 sample interview report
3. Wix (Website Builder) — with 1 sample interview report
4. AppsFlyer (Mobile Attribution)
5. Gong (Revenue Intelligence)
6. Cato Networks (Zero Trust Network)
7. Nvidia (AI/GPU Computing)
8. Papaya Global (HR Finance)
9. Fireblocks (Digital Asset Infrastructure)
10. Lightricks (Mobile Imaging)
11. Melio (B2B Payments)
12. Snyk (Developer Security)

Sample interview reports include Hebrew descriptions (overallProcess) + English technical terms/tags for consistency.

---

## Environment & Secrets

### .env (Local Development)
```
DATABASE_URL=postgresql://rd_intel_user:rd_intel_password@localhost:5432/rd_intel
JWT_SECRET=dev-secret-key-not-for-prod
GOOGLE_CLIENT_ID=<filled-in-later>
GOOGLE_CLIENT_SECRET=<filled-in-later>
API_PORT=3001
WEB_PORT=4200
```

### .env.example
Checked into repo (without secrets)

---

## API Endpoints (Task 1 Scope)

### GET /api/companies
Returns: `CompanySummaryDto[]`
- Company details
- Report count
- Question count
- Distinct stage types
- All tags (aggregated)

### Auth & Interview Mutation Endpoints (Implemented)
- **POST /api/auth/dev-login** — dev-only JWT login (find-or-create user by email; returns `AuthResponseDto`). Temporary stand-in for Google OAuth; frontend stores the token and sends it as `Authorization: Bearer`.
- **POST /api/interviews/submit** — submit an interview report. **Requires auth** (so `QuestionOwnership` can be recorded per question).
- **PATCH /api/interviews/questions/:id** — edit a question. **Owner-only**: requires auth; returns `403` unless the caller is the question's author (checked via `QuestionOwnership`).
- **DELETE /api/interviews/questions/:id** — delete a question. **Admin-only**: requires auth + `isAdmin` (`JwtAuthGuard` + `AdminGuard`).

Auth plumbing lives in `apps/api/src/auth/`: `JwtAuthGuard`, `AdminGuard`, `@CurrentUser()` decorator, `AuthModule` (registers `JwtModule`). Frontend: `apps/web/src/app/auth/` (`AuthService` + functional `authInterceptor`).

### Additional Endpoints (Future Tasks)
- POST /api/auth/google — Google OAuth signin (replaces dev-login)
- GET /api/companies/:slug — Company details (requires unlock)
- Etc.

---

## Development Workflow

### Start Services
```bash
# Terminal 1: PostgreSQL
docker-compose up

# Terminal 2: Backend
cd apps/api && pnpm dev

# Terminal 3: Frontend
cd apps/web && pnpm start
```

### Build & Test
```bash
pnpm build        # Turbo: all packages
pnpm test         # All tests
pnpm lint         # All linters
```

---

## Key Principles

1. **Contract-First**: Backend and Frontend work from `packages/shared` types
2. **Strict Anonymity**: No userId on interview data; company unlocks are per-user, not shared
3. **Credit Economy**: Balance rewards (submissions) vs. costs (unlocks)
4. **Hebrew RTL Support**: Angular index.html has `dir="rtl"`, Tailwind configures RTL
5. **Israeli Focus**: Seeded companies, cultural context
6. **Scalability**: Modular architecture, separation of concerns

---

## Deployment Notes (Future)

- Docker Compose for local dev only
- Production: Managed PostgreSQL (e.g., AWS RDS, Fly.io Postgres)
- Production: NestJS on Fly.io / Vercel / AWS, Angular static on Vercel / CloudFlare Pages
- Secrets: Environment variables or secret management (e.g., 1Password, Doppler)

