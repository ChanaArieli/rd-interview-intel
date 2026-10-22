# Render + Supabase Deployment Quickstart

**Full guide**: See [DEPLOY.md](./DEPLOY.md)

**Cost**: Backend $7/mo (Render) + Database $0/mo (Supabase Free) = **$7/month** 🎉

---

## 1. Create FREE PostgreSQL on Supabase (3 min)

1. Go to [supabase.com](https://supabase.com) → Sign up (free, no credit card)
2. Click **New Project**
3. Name: `rd-intel`, choose your region
4. Generate password (or use your account password)
5. Select **Free plan** → Create
6. Wait 1-2 min for initialization
7. Go to **Project Settings** → **Database** → **Connection string**
8. Copy the URI (looks like: `postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres`)

---

## 2. Deploy Backend (3 min)

### Option A: Blueprint (Easiest)
1. Commit & push: `git add render.yaml && git commit -m "Add Render config" && git push`
2. In Render: **New +** → **Blueprint**
3. Select repo, main branch, `render.yaml`
4. Set environment variables (see Step 3)
5. **Create**

### Option B: Manual
1. **New +** → **Web Service**
2. Connect GitHub repo
3. Build: `pnpm install && pnpm build`
4. Start: `cd apps/api && pnpm start`
5. Set environment variables (see Step 3)
6. **Create Web Service**

---

## 3. Set Backend Environment Variables

In Render backend service **Environment**:

```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
NODE_ENV=production
API_PORT=3001
FRONTEND_URL=https://rd-intel-frontend.onrender.com
JWT_SECRET=generate-32-random-characters
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

Replace `PASSWORD` with your Supabase database password and `db.xxx.supabase.co` with your actual Supabase host.

---

## 4. Run Database Migrations (2 min)

In backend service **Shell** tab:

```bash
cd apps/api
pnpm prisma db push
pnpm prisma db seed  # First time only
```

---

## 5. Deploy Frontend (3 min)

1. **New +** → **Web Service**
2. Connect GitHub repo
3. Build: `pnpm install && pnpm build`
4. Start: `cd apps/web && node server.js`
5. Environment:
   ```
   API_URL=https://rd-intel-backend.onrender.com/api
   NODE_ENV=production
   ```
6. **Create Web Service**

---

## 6. Test Deployment (1 min)

```bash
# Health check
curl https://rd-intel-backend.onrender.com/api/health

# Get companies
curl https://rd-intel-backend.onrender.com/api/companies

# Visit frontend
open https://rd-intel-frontend.onrender.com
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection timeout | Wait 2-3 min after creating DB |
| Build fails: "Cannot find module" | Add `--frozen-lockfile` to build: `pnpm install --frozen-lockfile && pnpm build` |
| Frontend 404 on routes | Add route `/*` → `index.html` in static site config |
| CORS errors | Check `FRONTEND_URL` env var matches your frontend URL |
| Migrations failed | Run manually in shell: `cd apps/api && pnpm prisma db push` |

---

## PostgreSQL Production Tips

- **Connections**: Starter = 20, Standard = 50, Pro = 100+
- **Backups**: Auto daily (7-day retention on Starter)
- **Scaling**: Start Starter ($7/mo), upgrade to Standard ($35/mo) for production traffic
- **Monitoring**: Check Render logs for connection pool exhaustion

---

## Useful Render Commands

```bash
# Access service shell
# Click service → Shell tab

# View database
pnpm prisma studio

# Check migration status
pnpm prisma migrate status

# View logs
# Click service → Logs tab
```

---

## Next Deployment (After Changes)

1. Commit & push to main:
   ```bash
   git add . && git commit -m "Update: your change" && git push
   ```

2. Render auto-redeploys (watch Deploys tab)

3. If database schema changed:
   ```bash
   # In backend shell
   cd apps/api && pnpm prisma db push
   ```

---

## Billing Estimate (First Year)

- **PostgreSQL (Supabase Free)**: $0 × 12 = **$0** 🎉
- Backend (Render Starter): $7 × 12 = **$84**
- Frontend (Render Starter): $7 × 12 = **$84**
- **Total**: ~**$168/year** (vs $252 with paid database!)

When you need more:
- Supabase upgrade: $25+/month for 8GB storage
- Render upgrade: $12-36+/month depending on needs

---

For detailed troubleshooting and production best practices, see **[DEPLOY.md](./DEPLOY.md)**.
