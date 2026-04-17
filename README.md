# Reyrr Visor Request Form

Typeform-style form for players to pick between **Reyrr VIZU** and **Reyrr Vision** visors. Each submission lands in a Postgres row; an authenticated endpoint generates a fresh `.xlsx` on demand.

Built for Vercel. Works locally with a JSON-file fallback (no DB setup needed for dev).

---

## Local development

```bash
cd "Reyrr Athletics Sweden AB/reyrr-visor-request"
npm install
npm run dev          # → http://localhost:3018
```

With no `DATABASE_URL` set, submissions write to `data/submissions-local.json`.

### Local Excel download

```
http://localhost:3018/api/export?key=reyrr-dev-key-change-me
```

The `EXPORT_KEY` value is set in `.env.local`.

---

## Deploying to Vercel

### 1. Create a free Neon Postgres database

1. Go to **https://console.neon.tech** and sign up (free tier, no credit card).
2. Create a new project — name it `reyrr-visor-form`, pick the Frankfurt region.
3. Copy the connection string from the dashboard. It looks like:
   ```
   postgresql://username:password@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Push to GitHub (first-time setup)

```bash
cd "Reyrr Athletics Sweden AB/reyrr-visor-request"
git init
git add .
git commit -m "Initial commit — Reyrr visor request form"
gh repo create reyrr-visor-form --private --source=. --push
```

### 3. Deploy to Vercel

1. Go to **https://vercel.com/new** and import the GitHub repo.
2. Vercel auto-detects Next.js — just click **Deploy**.
3. Once deployed, go to **Settings → Environment Variables** and add:
   - `DATABASE_URL` = the Neon connection string from step 1
   - `EXPORT_KEY` = a long random string (e.g. run `openssl rand -hex 24`)
4. Redeploy (Deployments → latest → **⋯** → Redeploy) so the env vars take effect.

### 4. Use it

- **Form (share with players)**: `https://<your-project>.vercel.app/`
- **Download latest Excel (bookmark this)**:
  ```
  https://<your-project>.vercel.app/api/export?key=<YOUR_EXPORT_KEY>
  ```

The Excel file auto-regenerates every time you hit that URL, with every submission ever made.

---

## File structure

```
reyrr-visor-request/
├── app/
│   ├── page.tsx                   # Landing + 3-step form (client)
│   ├── layout.tsx                 # HTML shell, Google Fonts
│   ├── globals.css                # Reyrr dark theme
│   └── api/
│       ├── submit/route.ts        # POST — insert a submission
│       └── export/route.ts        # GET  — auth-gated xlsx export
├── components/
│   ├── StepLanding.tsx            # Hero screen
│   ├── StepName.tsx               # Name input
│   ├── StepProduct.tsx            # VIZU / Vision picker
│   └── StepDone.tsx               # Confirmation
├── data/
│   └── products.json              # VIZU + Vision metadata
├── lib/
│   └── db.ts                      # Neon + local JSON fallback
├── public/visors/                 # Product images
├── .env.local                     # DATABASE_URL + EXPORT_KEY (git-ignored)
└── .claude/launch.json            # Preview dev server config
```

## Swapping products

Edit `data/products.json`. If you change image filenames, drop the new images into `public/visors/` too. Only the two entries currently there are accepted by `/api/submit` (validated server-side).

## Troubleshooting

- **`/api/export` returns 500 "EXPORT_KEY not configured"** → set the `EXPORT_KEY` env var in Vercel and redeploy.
- **Submissions aren't showing up after deploy** → verify `DATABASE_URL` is set in Vercel. Without it, the serverless function silently falls back to a local JSON file that gets wiped on every request (Vercel's filesystem is read-only).
- **Want to wipe all submissions** → in Neon's SQL editor: `TRUNCATE submissions RESTART IDENTITY;`
