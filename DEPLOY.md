# Deployment Guide: Render + Supabase

## Overview

This guide covers deploying the R&D Interview Intelligence platform to **Render** using:
- **Backend**: NestJS on Render Web Service
- **Frontend**: Angular on Render Web Service
- **Database**: FREE PostgreSQL on Supabase

**Cost**: ~$7/month for two Render services. Database is **FREE** (500MB, perfect for MVP).

---

## Step 1: Set Up FREE PostgreSQL on Supabase

### Create a Supabase Project (Free Forever)

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click **New Project**
3. Configure:
   - **Name**: `rd-intel`
   - **Password**: Generate strong password (or create account password)
   - **Region**: Choose closest to your users
   - **Plan**: Free (default)

4. Wait 1-2 minutes for project to initialize
5. Go to **Project Settings** → **Database** → **Connection string**
6. Copy the URI (Session or Connection Pooling):
   ```
   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### Supabase Free Tier Includes

✅ **500MB storage** (plenty for MVP)
✅ **2GB bandwidth/month**
✅ **50k monthly active users**
✅ **Automatic daily backups** (7-day retention)
✅ **SSL/TLS enforced**
✅ **Connection pooling built-in**
✅ **Zero cost** (forever free, no credit card required after 7 days)

### Important Notes

**Connection String Format:**
- Use the connection string provided by Supabase
- Includes built-in connection pooling
- SSL is automatic (sslmode=require)

**Scaling:**
- 500MB is enough for ~1M rows with normal data
- When you need more: upgrade to paid plan ($25+/month for 8GB)
- No downtime during upgrade

**Backups:**
- Automatic daily backups (7 days on free plan)
- Manual backups available in Supabase dashboard
- Download backups as SQL files anytime

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
DATABASE_URL = postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
NODE_ENV = production
API_PORT = 3001
FRONTEND_URL = https://rd-intel-frontend.onrender.com
JWT_SECRET = (generate at least 32 random characters)
GOOGLE_CLIENT_ID = (from Google Cloud Console)
GOOGLE_CLIENT_SECRET = (from Google Cloud Console)
```

**Get DATABASE_URL from Supabase:**
1. Go to [supabase.com](https://supabase.com) → Your Project
2. Click **Project Settings** → **Database**
3. Copy the **Connection string (URI)**

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
**Cause**: Supabase project still initializing
**Solution**: Wait 2-3 minutes after creating the project, then try again

### **Issue 2: "password authentication failed"**
**Cause**: Wrong connection string or password
**Solution**: 
1. Go to Supabase dashboard → Your Project
2. Click **Settings** → **Database**
3. Copy the connection string again (including password)
4. Paste into `DATABASE_URL` env var

### **Issue 3: "Cannot find module" during build**
**Cause**: pnpm workspaces not properly installed
**Solution**: Ensure `pnpm-workspace.yaml` is correct; add to build command:
```
pnpm install --frozen-lockfile && pnpm build
```

### **Issue 4: Frontend returns 404 on routes**
**Cause**: SPA routing not configured
**Solution**: Using `server.js` handles this automatically. Ensure start command is `cd apps/web && node server.js`

### **Issue 5: CORS errors in browser**
**Cause**: `FRONTEND_URL` env var not set correctly
**Solution**: Verify in backend environment variables and restart the service

### **Issue 6: Migrations failed on first deploy**
**Cause**: Database schema not initialized or connection string wrong
**Solution**: Use Render Shell to manually run:
```bash
cd apps/api && pnpm prisma db push && pnpm prisma db seed
```
If connection fails, verify `DATABASE_URL` env var is correct

---

## Supabase PostgreSQL Production Best Practices

### 1. Connection Pooling
- Supabase handles connection pooling automatically (PgBouncer)
- Built-in pooling supports high concurrency
- Max connections on Free tier: 20 concurrent connections
- Upgrade to Pro plan for higher concurrency if needed

### 2. Backups
- **Automatic**: Daily backups (7-day retention on free tier)
- **Manual backup**: Go to Supabase **Project Settings** → **Backups** → Download
- **Restore from backup**: Click any backup → **Restore** (2-3 min process)
- **Export SQL**: 
  ```bash
  pg_dump "postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres" > backup.sql
  ```

### 3. Monitoring
- View storage usage: **Project Settings** → **Database**
- View connection logs: **Project Settings** → **Logs**
- Monitor bandwidth: **Project Settings** → **Billing**
- Supabase dashboard shows real-time metrics

### 4. Scaling
- **Free Tier**: 500MB storage, 2GB bandwidth/month (good for MVP)
- **When to upgrade**: Approaching 500MB or 2GB bandwidth
- **Pro Plan**: $25+/month for 8GB storage, unlimited bandwidth
- **No downtime**: Upgrades are instant with no app restart

### 5. Data Retention
- Free tier: 7-day automatic backups (retention configurable in Supabase)
- Pro tier: Up to 30-day retention
- Download backups anytime as SQL files for external storage

---

## Deployment Checklist

- [ ] Supabase project created (free tier)
- [ ] Supabase connection string copied
- [ ] Backend service created on Render
- [ ] DATABASE_URL env var set in backend
- [ ] Database migrations run (`cd apps/api && pnpm prisma db push`)
- [ ] Database seeded with sample data (`cd apps/api && pnpm prisma db seed`)
- [ ] Backend health check working (`/api/health` returns 200)
- [ ] Frontend service created on Render
- [ ] Frontend connects to backend API
- [ ] CORS configured for production frontend URL
- [ ] API connectivity tested from frontend
- [ ] Environment variables set in both services
- [ ] JWT_SECRET generated and set (32+ random chars)
- [ ] Google OAuth credentials configured (if implementing auth)

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
