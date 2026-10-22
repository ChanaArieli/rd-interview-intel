# R&D Interview Intelligence & Engineering Culture Platform

Israeli tech company interview intelligence and engineering culture platform — a technical, developer-focused alternative to Glassdoor.

## Tech Stack

- **Monorepo**: `pnpm` workspaces + `turbo`
- **Backend**: NestJS + TypeScript (port 3001)
- **Frontend**: Angular Standalone (port 4200, RTL support)
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Prisma

## Prerequisites

- **Node.js** 18+ and `pnpm` (`npm install -g pnpm`)
- **Docker & Docker Compose** (for PostgreSQL)

## Local Setup

### 1. Install Dependencies

```bash
pnpm install --allow-build=puppeteer
```

If you get build script warnings, run:
```bash
pnpm install --allow-build=puppeteer
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

Verify the database is running:
```bash
docker ps  # Should show postgres container
```

### 3. Set Up Database Schema

```bash
cd apps/api
pnpm prisma migrate dev      # Apply migrations & generate client
pnpm prisma db seed          # Seed companies & sample data
```

If Prisma client isn't generated:
```bash
pnpm prisma generate
```

### 4. Configure Environment

Create `.env` files:

**apps/api/.env**
```
DATABASE_URL=postgresql://rd_intel_user:rd_intel_password@localhost:5432/rd_intel
JWT_SECRET=dev-secret-key-not-for-prod
GOOGLE_CLIENT_ID=dev
GOOGLE_CLIENT_SECRET=dev
API_PORT=3001
```

**apps/web/.env**
```
NG_APP_API_URL=http://localhost:3001
```

## Running Locally

### Terminal 1: Backend API
```bash
cd apps/api
pnpm dev
# Backend runs on http://localhost:3001
# Swagger docs: http://localhost:3001/api/docs
```

### Terminal 2: Frontend
```bash
cd apps/web
pnpm start
# Frontend runs on http://localhost:4200
```

## Testing Locally

### 1. Check Backend Health
```bash
curl http://localhost:3001/api/health
```

### 2. Get All Companies
```bash
curl http://localhost:3001/api/companies
```

This returns seeded Israeli tech companies (Wiz, Monday.com, Wix, etc.) with:
- Company details (name, slug, industry)
- Report count
- Question count
- Interview stage types
- Aggregated tags

### 3. Get Company Details
```bash
curl http://localhost:3001/api/companies/wiz
```

Returns company with all interview reports and questions.

### 4. Submit an Interview Question
```bash
curl -X POST http://localhost:3001/api/interviews/submit \
  -H 'Content-Type: application/json' \
  -d '{
    "companyName": "Your Company",
    "interviewPeriod": "Q4 2026",
    "questions": [{
      "stageType": "Live Coding",
      "questionText": "Your question here",
      "tags": []
    }]
  }'
```

### 5. Browse Frontend
Open http://localhost:4200 in your browser. You should see:
- Company list with interview reports
- "תרום שאלה" (Contribute Question) button to submit new questions
- "צפה בפרטים" (View Details) button to see all questions for a company
- Interview questions grouped by report
- Hebrew RTL layout

## Project Structure

```
.
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   ├── prisma/       # Database schema
│   │   └── package.json
│   └── web/              # Angular frontend
│       ├── src/
│       └── package.json
├── packages/
│   └── shared/           # TypeScript DTOs & interfaces
├── docker-compose.yml    # PostgreSQL config
├── pnpm-workspace.yaml   # pnpm workspace
├── turbo.json           # Turborepo config
└── CLAUDE.md            # Detailed project spec
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linters
pnpm lint

# View database (Prisma Studio)
cd apps/api && pnpm prisma studio

# Reset database
cd apps/api && pnpm prisma migrate reset
```

## Troubleshooting

### Database connection failed
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart if needed
docker-compose down && docker-compose up -d
```

### Port already in use
- Backend (3001): `lsof -i :3001` to find process, `kill -9 <PID>`
- Frontend (4200): `lsof -i :4200` to find process, `kill -9 <PID>`

### Prisma schema out of sync
```bash
cd apps/api
pnpm prisma migrate dev  # Creates migration + applies it
```

## Features

### Current Implementation
- ✅ **Company List** - Browse all seeded Israeli tech companies with stats
- ✅ **Contribute Questions** - Modal form to submit interview questions
  - Free-text company name with autocomplete suggestions
  - Auto-creates new companies if not in database
  - Required fields: company name, interview period, stage type, question text
  - Optional fields: role category, seniority, difficulty, follow-ups, tips, tags
- ✅ **Company Details** - View all interview questions for a company
  - Questions grouped by interview report
  - Display stage type, follow-ups, tips, and tags
  - Report metadata (role, seniority, period, difficulty)
- ✅ **Routing** - Navigate between companies list and detail pages
- ✅ **RTL Support** - Full Hebrew right-to-left layout

### Planned
- 🔄 Google OAuth authentication
- 🔄 Credit system (earn/spend credits)
- 🔄 Interview report quality validation (LLM gate)
- 🔄 User profiles and company unlocks

## Architecture

- **Strict Anonymity**: Interview submissions have no user ID; anonymous knowledge base
- **Credit Economy**: Users get 1 starter credit on signup, earn credits by submitting valid reports
- **Contract-First**: Shared TypeScript types in `packages/shared` keep backend/frontend in sync
- **CORS**: Backend CORS enabled for `http://localhost:4200`
- **Dynamic Company Creation**: Accept any company name, auto-create if needed

For full project details, see **CLAUDE.md**.

## Deployment

### To Production: Render + Supabase (FREE Database!)

This project is configured for easy deployment to **Render** with **FREE PostgreSQL on Supabase** (no credit card required).

**Cost**: ~$7/month (two Render services) + **$0 database** = **$7/month total!**

**Quick Start:**
1. Create FREE Supabase project (500MB storage)
2. Create two Render web services (backend + frontend)
3. Push to GitHub
4. Deploy using `render.yaml` blueprint or manual setup
5. Run database migrations
6. Configure environment variables

**Setup Guides:**
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** — Quick Supabase setup (5 min)
- **[RENDER_QUICKSTART.md](./RENDER_QUICKSTART.md)** — Quick Render deployment (5 step overview)
- **[DEPLOY.md](./DEPLOY.md)** — Complete detailed guide including:
  - Step-by-step Supabase & Render setup
  - PostgreSQL best practices
  - Database migration strategies
  - Environment configuration
  - Troubleshooting
