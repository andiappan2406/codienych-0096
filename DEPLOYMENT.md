# BuildGuard AI - Vercel Deployment & Database Guide

BuildGuard is fully configured for seamless, zero-config deployment to **Vercel** with support for **PostgreSQL** (Supabase, Neon, Vercel Postgres, or self-hosted).

---

## 🚀 Quick Deploy to Vercel (1-Click)

### Step 1: Push Code to GitHub / GitLab
```bash
git add .
git commit -m "feat: mobile responsive view, database adapter, serverless AI engine"
git push origin main
```

### Step 2: Import Project into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **Import Repository** and select your `buildguard` repository.
3. Framework Preset will be automatically detected as **Next.js**.

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

BuildGuard features a **dual-mode database architecture**:
- **Zero-Config Mode**: If no database connection string is provided, BuildGuard automatically serves live telemetry, assets, alerts, and work orders using its persistent in-memory engine.
- **Production Mode (PostgreSQL / Supabase)**: When `DATABASE_URL` or `POSTGRES_URL` is set, BuildGuard automatically connects, creates all required tables (`buildguard_assets`, `buildguard_sensor_telemetry`, `buildguard_alerts`, `buildguard_work_orders`), and seeds initial equipment data.

### Setting Up Supabase Database (Recommended)
1. Create a free project at [Supabase](https://supabase.com).
2. Go to **Project Settings** → **Database** → **Connection String** → **URI**.
3. In your **Vercel Project Settings** → **Environment Variables**, add:
   ```env
   DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require
   ```
4. Once deployed, open `/setup` in your app and click **&quot;Initialize &amp; Seed Database&quot;** to verify your database connection.

---

## 🧠 Serverless Multi-Agent AI Engine

All 4 AI diagnostic agents run as serverless TypeScript functions:
- **Watch Agent**: Isolation Z-score & dynamic contextual anomaly detector.
- **Diagnose Agent**: Multi-sensor degradation & failure probability classifier.
- **Predict Agent**: Remaining Useful Life (RUL) trajectory regressor.
- **Plan & Explain Agent**: Sugeno fuzzy logic + neuro-symbolic domain rule reasoning.

Zero external dependencies on Python servers needed — the entire stack is 100% self-contained in Next.js!

---

## 📱 Mobile View Support

All pages are optimized for mobile viewports (320px - 768px):
- Responsive slide-out navigation drawer with touch gestures.
- Sticky mobile header with system status indicators.
- Adaptive chart aspect ratios using SVG `ResponsiveContainer`.
- Touch-friendly action buttons and sliders.
