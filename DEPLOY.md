# Deployment Guide: Render

## Overview

This guide covers deploying the R&D Interview Intelligence platform to **Render** using:
- **Backend**: NestJS on Render Web Service
- **Frontend**: Angular static site on Render Web Service
- **Database**: PostgreSQL on Render Managed Database

---

## Step 1: Set Up PostgreSQL on Render

### Create a PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `rd-intel-postgres`
   - **Database**: `rd_intel`
   - **User**: `rd_intel_user`
   - **Region**: Choose closest to your target users
   - **Plan**: Starter ($7/month) or higher

4. **Copy the connection string** (looks like):
   ```
   postgresql://rd_intel_user:password@pg-xxx.render.com:5432/rd_intel
   ```

### Important Notes on PostgreSQL Production

**Connection Pooling:**
- Render PostgreSQL has built-in connection pooling
- For production, add `?schema=public` to the connection string if needed
- Max connections on Starter: 20

**Backups:**
- Render auto-backs up PostgreSQL daily
- Stored for 7 days (Starter plan)
- Upgrade plan for longer retention

**SSL/TLS:**
- Render enforces SSL by default
- Connection strings automatically use `sslmode=require`

---

## Step 2: Deploy Backend (NestJS API)

### Option A: Using render.yaml (Recommended - Infrastructure as Code)

1. Commit `render.yaml` to your repo:
   ```bash
   git add render.yaml .env.production.example
   git commit -m "Add Render deployment configuration"
   git push
   ```

2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New +** → **Blueprint**
4. Connect your GitHub repo
5. Select `main` branch and `render.yaml`
6. Click **Create**

### Option B: Manual Setup

1. Click **New +** → **Web Service**
2. Connect GitHub repository
3. Configure:
   - **Name**: `rd-intel-backend`
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     pnpm install && pnpm build
     ```
   - **Start Command**: 
     ```
     cd apps/api && pnpm start
     ```
   - **Plan**: Starter ($7/month) - good for development, upgrade to Standard for production

4. Add Environment Variables (in Render dashboard):
   ```
   DATABASE_URL=postgresql://rd_intel_user:password@pg-xxx.render.com:5432/rd_intel
   NODE_ENV=production
   API_PORT=3001
   FRONTEND_URL=https://rd-intel-frontend.onrender.com
   JWT_SECRET=<generate-a-strong-32-char-key>
   GOOGLE_CLIENT_ID=<your-google-oauth-id>
   GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
   ```

5. Click **Create Web Service**

### Run Database Migrations

Once the backend is deployed:

1. Go to the backend service's **Shell** tab in Render
2. Run:
   ```bash
   cd apps/api && pnpm prisma db push
   ```

3. **Seed the database** (first time only):
   ```bash
   cd apps/api && pnpm prisma db seed
   ```

4. Verify your database was seeded:
   ```bash
   curl https://rd-intel-backend.onrender.com/api/companies
   ```

---

## Step 3: Deploy Frontend (Angular)

### Manual Setup (via Render Web Service)

1. Click **New +** → **Web Service**
2. Connect GitHub repository
3. Configure:
   - **Name**: `rd-intel-frontend`
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     pnpm install && pnpm build
     ```
   - **Start Command**: 
     ```
     cd apps/web && node server.js
     ```
     
     **OR** for static hosting (simpler):
     ```
     npx http-server dist -p $PORT
     ```
   
   - **Plan**: Starter ($7/month)

4. Add Environment Variables:
   ```
   NODE_ENV=production
   API_URL=https://rd-intel-backend.onrender.com/api
   ```

5. Click **Create Web Service**

### Advanced: Static Site on Render

For a lighter-weight deployment, serve the Angular build as static files:

1. Click **New +** → **Static Site**
2. Connect GitHub repository
3. Configure:
   - **Name**: `rd-intel-frontend`
   - **Build Command**: `pnpm install && pnpm build`
   - **Publish Directory**: `apps/web/dist/rd-intel/browser` (or wherever Angular outputs)

4. In **Routes**, add:
   - Route `/*` → `index.html` (for SPA routing)

5. Click **Create Static Site**

**Note**: You'll need to update your Angular environment files to point to the backend API before building.

---

## Step 4: Configure Environment Variables

### For Backend Service

Set in Render dashboard under **Environment**:

```
DATABASE_URL = postgresql://rd_intel_user:PASSWORD@pg-xxx.render.com:5432/rd_intel
NODE_ENV = production
API_PORT = 3001
FRONTEND_URL = https://rd-intel-frontend.onrender.com
JWT_SECRET = (generate at least 32 random characters)
GOOGLE_CLIENT_ID = (from Google Cloud Console)
GOOGLE_CLIENT_SECRET = (from Google Cloud Console)
```

### For Frontend Service

```
API_URL = https://rd-intel-backend.onrender.com/api
NODE_ENV = production
```

**Important**: Never commit `.env` files with secrets to version control. Use Render's environment variable UI.

---

## Step 5: Update CORS

The backend CORS is now configured to accept:
- `http://localhost:4200` (development)
- Value of `FRONTEND_URL` env var (production)

Verify in `apps/api/src/main.ts`.

---

## Step 6: Test the Deployment

### Health Check
```bash
curl https://rd-intel-backend.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-10-22T12:00:00.000Z"}
```

### List Companies
```bash
curl https://rd-intel-backend.onrender.com/api/companies
```

### Visit Frontend
Open `https://rd-intel-frontend.onrender.com` in browser

---

## Common Issues & Solutions

### **Issue 1: Database connection timeout**
**Cause**: PostgreSQL may still be initializing
**Solution**: Wait 2-3 minutes after creating the DB, then retry deployment

### **Issue 2: "Cannot find module" during build**
**Cause**: pnpm workspaces not properly installed
**Solution**: Ensure `pnpm-workspace.yaml` is correct; add to build command:
```
pnpm install --frozen-lockfile && pnpm build
```

### **Issue 3: Frontend returns 404 for routes**
**Cause**: SPA routing not configured
**Solution**: If using Static Site, add route `/*` → `index.html` in **Routes**

### **Issue 4: CORS errors in browser**
**Cause**: `FRONTEND_URL` env var not set correctly
**Solution**: Verify in backend environment variables and restart the service

### **Issue 5: Migrations failed on first deploy**
**Cause**: Database schema not initialized
**Solution**: Use Render Shell to manually run:
```bash
cd apps/api && pnpm prisma db push && pnpm prisma db seed
```

---

## PostgreSQL Production Best Practices

### 1. Connection Pooling
- Render handles connection pooling automatically
- For very high traffic, consider upgrading to **Standard** or **Pro** plan
- Max connections:
  - **Starter**: 20
  - **Standard**: 50
  - **Pro**: 100+

### 2. Backups
- **Automatic**: Daily backups (7-day retention on Starter)
- **Manual**: Use `pg_dump`:
  ```bash
  pg_dump $DATABASE_URL > backup.sql
  ```
- **Restore**: Use `psql` to restore from dump

### 3. Monitoring
- View logs in Render dashboard under **Logs**
- Watch for connection pool exhaustion or slow queries
- Use Prisma's query logging if needed

### 4. Scaling
- **Development**: Starter plan ($7/month, 20 connections)
- **Production**: Upgrade to Standard+ plan (50+ connections, better specs)
- **High Traffic**: Consider switching to AWS RDS or Supabase for auto-scaling

### 5. Data Retention
- Starter plan: 7-day automatic backups
- Upgrade for longer retention or manual backup schedules

---

## Deployment Checklist

- [ ] PostgreSQL instance created on Render
- [ ] Database connection string copied
- [ ] Backend service created with correct env vars
- [ ] Database migrations run (`prisma db push`)
- [ ] Database seeded with sample data (`prisma db seed`)
- [ ] Backend health check working
- [ ] Frontend service created
- [ ] CORS configured for production URL
- [ ] API connectivity tested from frontend
- [ ] Environment variables set in both services
- [ ] JWT_SECRET generated and set
- [ ] Google OAuth credentials configured (if applicable)

---

## Updating the Application

### Deploy a New Version

1. Commit and push changes to `main` branch:
   ```bash
   git add .
   git commit -m "Feature: add new functionality"
   git push origin main
   ```

2. Render will automatically redeploy (if auto-deploy is enabled)

3. Monitor deployment in Render dashboard

### Manual Migration (if needed)

If database schema changes:

1. Update `apps/api/prisma/schema.prisma`
2. Push to main
3. Render redeploys automatically
4. Manually run migration in Render Shell:
   ```bash
   cd apps/api && pnpm prisma db push
   ```

---

## Useful Commands

### Remote Shell Access
Access the backend service's shell in Render dashboard:
```bash
cd apps/api

# View database
pnpm prisma studio

# Check migrations
pnpm prisma migrate status

# Seed database
pnpm prisma db seed
```

### Check Logs
```bash
# In Render dashboard, click "Logs" on the service
```

### Rollback
To rollback to a previous deploy:
1. Go to Render service dashboard
2. Click **Deploys**
3. Select the previous deployment and click **Rollback**

---

## Next Steps

1. Set up monitoring/alerting (Render native or third-party)
2. Configure custom domain name
3. Set up CI/CD pipeline for automated tests before deploy
4. Plan database scaling strategy as user base grows
5. Document operational runbook for your team

---

## Support

- **Render Docs**: https://render.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Prisma Docs**: https://www.prisma.io/docs/
