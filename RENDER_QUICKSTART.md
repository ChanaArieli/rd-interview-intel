# Render Deployment Quickstart

**Full guide**: See [DEPLOY.md](./DEPLOY.md)

---

## 1. Create PostgreSQL (5 min)

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. **New +** → **PostgreSQL**
3. Name: `rd-intel-postgres`
4. Database: `rd_intel`, User: `rd_intel_user`
5. Choose region, Starter plan ($7/mo)
6. **Create** and copy connection string

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
DATABASE_URL=postgresql://rd_intel_user:PASSWORD@pg-xxx.render.com:5432/rd_intel
NODE_ENV=production
API_PORT=3001
FRONTEND_URL=https://rd-intel-frontend.onrender.com
JWT_SECRET=generate-32-random-characters
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

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

- PostgreSQL (Starter): $7 × 12 = **$84**
- Backend (Starter): $7 × 12 = **$84**
- Frontend (Starter): $7 × 12 = **$84**
- **Total**: ~**$252/year** (or upgrade to Standard for ~$1,260/year for production)

---

For detailed troubleshooting and production best practices, see **[DEPLOY.md](./DEPLOY.md)**.
