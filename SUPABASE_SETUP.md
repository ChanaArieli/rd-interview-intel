# Supabase Setup Guide (FREE PostgreSQL)

**Complete free tier PostgreSQL hosting — no credit card required after 7 days.**

---

## Quick Setup (5 minutes)

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click **Sign Up** (use GitHub, Google, or email)
3. No credit card required for free tier

### 2. Create a New Project
1. Click **New Project**
2. Enter project name: `rd-intel`
3. Create a strong database password (or let Supabase generate one)
4. Select your region (closest to where users are)
5. Select **Free** plan (default)
6. Click **Create new project**
7. Wait 1-2 minutes for initialization

### 3. Get Your Connection String
1. Click your project
2. Go to **Project Settings** (bottom left)
3. Click **Database** tab
4. Scroll to **Connection strings**
5. Choose **URI** (not Psycopg)
6. Copy the connection string:
   ```
   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
   
   Replace `[PASSWORD]` with the database password you created

---

## Deploy with Render

### In Render Backend Environment Variables:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
NODE_ENV=production
API_PORT=3001
FRONTEND_URL=https://rd-intel-frontend.onrender.com
JWT_SECRET=your-32-character-random-key
GOOGLE_CLIENT_ID=your-oauth-id
GOOGLE_CLIENT_SECRET=your-oauth-secret
```

### Run Migrations in Render Shell:

```bash
cd apps/api
pnpm prisma db push      # Create schema
pnpm prisma db seed      # Add sample data
```

---

## Test Connection Locally

Before deploying, test with Supabase:

```bash
# Update .env locally
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres

# Test connection
cd apps/api
pnpm prisma db push
pnpm prisma db seed

# Verify schema
pnpm prisma studio
```

---

## Free Tier Limits

| Feature | Free Tier | Paid Plan |
|---------|-----------|-----------|
| **Storage** | 500MB | 8GB+ |
| **Bandwidth** | 2GB/month | 50GB+/month |
| **Users** | 50k MAU | Unlimited |
| **Backups** | Daily (7-day retention) | Daily + custom retention |
| **Cost** | **$0** | $25+/month |

**When to upgrade:**
- Approaching 500MB storage (or ~1M rows of normal data)
- Needing more than 2GB bandwidth/month
- For production with 50k+ monthly active users

---

## Managing Your Database

### Access Supabase Dashboard

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Left sidebar tabs:
   - **SQL Editor** — Run raw SQL queries
   - **Tables** — Browse data
   - **Auth** — Manage users (if using Supabase Auth)
   - **Storage** — File uploads (not used in this project)

### View Your Data

1. Click **Tables** in left sidebar
2. Select table: `users`, `companies`, `interview_reports`, `interview_questions`
3. Browse and filter data
4. Export to CSV if needed

### Backup Your Data

1. Go to **Project Settings** → **Backups**
2. View automatic daily backups
3. To download: Click backup → **Download**

### Monitor Your Database

1. Go to **Project Settings** → **Database**
2. View current storage usage
3. View connection logs

---

## Connecting with Prisma (Already Set Up)

Your Prisma setup already works with Supabase. Just update the connection string:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then:
```bash
# Push schema to Supabase
pnpm prisma db push

# Seed with sample data
pnpm prisma db seed

# Open Prisma Studio to view data
pnpm prisma studio
```

---

## Common Issues

### Issue: "connection timeout"
**Cause**: Supabase project still initializing
**Solution**: Wait 2-3 minutes and try again

### Issue: "password authentication failed"
**Cause**: Wrong password in connection string
**Solution**: Copy connection string from Supabase dashboard again (including password)

### Issue: "too many connections"
**Cause**: Using free tier on high-traffic app (rarely happens on MVP)
**Solution**: Upgrade to paid plan or optimize connection pooling

### Issue: "Database name is wrong"
**Cause**: Supabase defaults to `postgres` database
**Solution**: Connection string should end with `/postgres`, not `/rd_intel`

---

## Upgrading Later

When your app grows:

1. Go to **Project Settings** → **Billing**
2. Click **Change plan**
3. Select **Pro** plan ($25+/month)
4. No downtime during upgrade
5. All data preserved automatically

---

## Disaster Recovery

### If You Accidentally Delete Data

1. Go to **Project Settings** → **Backups**
2. Click a previous backup
3. Click **Restore**
4. Confirm restoration (2-3 min process)

### Download Full Database Backup

```bash
# Using pg_dump
pg_dump "postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres" > backup.sql

# Restore from dump
psql "postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres" < backup.sql
```

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Copy connection string
3. ✅ Add to Render environment variables
4. ✅ Run `pnpm prisma db push` in Render shell
5. ✅ Run `pnpm prisma db seed` in Render shell
6. ✅ Test API endpoints

---

## Helpful Links

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Connection Pooling**: https://supabase.com/docs/guides/database/connections/connection-pooling-realtime

---

**Save $84/year by using Supabase free tier! 🎉**
