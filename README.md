# 🏢 BuildGuard AI — Predictive Maintenance Platform

AI-driven building infrastructure health monitoring, predictive maintenance, and neuro-symbolic root-cause diagnostics.

---

## 🚀 1-Minute Deployment (Free on Vercel via GitHub)

### Step 1: Push your code to GitHub
```bash
git add .
git commit -m "Deploy BuildGuard AI"
git push origin main
```

### Step 2: Deploy to Vercel (Free Hosting)
1. Visit **[vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **"Add New Project"** and select `andiappan2406/codienych-0096`.
3. Click **"Deploy"**. Vercel will automatically build and publish your app with free HTTPS and a `.vercel.app` URL.

---

## 🗄️ Connect a Free Online Database (Supabase or Neon)

BuildGuard includes an automated PostgreSQL adapter that auto-creates all schema tables and persists live telemetry.

### Option A: Free Supabase PostgreSQL (Recommended)
1. Create a free account at **[supabase.com](https://supabase.com)**.
2. Create a new project (select your region).
3. Go to **Project Settings** → **Database** → **Connection String** → select **URI (Transaction Pooler)**.
4. Copy the connection string (it looks like `postgresql://postgres.xxxx:your-password@aws-0-xx.pooler.supabase.com:6543/postgres?sslmode=require`).
5. In your **Vercel Project Dashboard** (or `.env.local` locally):
   - Add environment variable:
     - `DATABASE_URL` = `your-supabase-connection-string`
6. Open your deployed website, navigate to `/setup` → **Database tab**, and click **"Initialize & Seed Database"**. All tables and asset telemetry will be created automatically!

### Option B: Free Neon PostgreSQL
1. Create a free database at **[neon.tech](https://neon.tech)**.
2. Copy your connection URI.
3. Set `DATABASE_URL` in Vercel environment variables.

---

## 💻 Running Locally

### 1. Next.js Frontend & Serverless Engine
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 2. (Optional) Local Python Multi-Agent FastAPI Backend
```bash
cd backend
./venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
