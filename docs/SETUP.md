# Gayla E-commerce Platform - Setup Guide

This guide will help you set up the Gayla e-commerce platform locally for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or later ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Convex Account** (free) - [Sign up](https://convex.dev/)
- **Resend Account** (optional for email) - [Sign up](https://resend.com/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/gayla-shop.git
cd gayla-shop
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:

- Next.js (React framework)
- Convex (backend + database)
- Tailwind CSS + shadcn/ui (styling)
- next-intl (internationalization)
- TipTap (rich text editor)
- And more...

## Step 3: Set Up Convex

### 3.1 Initialize Convex

```bash
npx convex dev
```

This command will:

- Prompt you to log in to Convex (creates account if needed)
- Create a new Convex project
- Generate `.env.local` with your deployment URL
- Deploy the database schema automatically
- Start watching for changes

**Keep this terminal running** — it watches for backend changes.

### 3.2 Verify Convex Connection

Open your [Convex Dashboard](https://dashboard.convex.dev) and verify:

- You see your project (e.g. `valiant-cassowary-87`)
- Database shows 5 tables: `products`, `orders`, `siteContent`, `deliveryCosts`, `adminUsers`

## Step 4: Configure Environment Variables

Your `.env.local` should already have Convex variables from Step 3. Add the rest:

```bash
# .env.local (Convex vars already added by npx convex dev)
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Add these manually:
RESEND_API_KEY=re_xxxxxxxxxxxx   # Get from https://resend.com/api-keys
ADMIN_EMAIL=admin@gayla.dz
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# ZR Express (optional — mock API works without these)
ZR_EXPRESS_API_URL=https://procolis.com/api/v1
ZR_EXPRESS_TOKEN=placeholder
ZR_EXPRESS_KEY=placeholder
```

**Note:** Email functionality requires a Resend API key. For development, emails will fail gracefully without it.

## Step 5: Start the Development Server

Open a **new terminal** (keep Convex running in the first one) and run:

```bash
npm run dev
```

The app should be running at **http://localhost:3000**.

## Step 6: Verify Installation

### Check Next.js

1. Open http://localhost:3000
2. You should see the app (or the Next.js default page during early development)

### Check Convex

- In the Convex terminal you should see: **✔ Convex functions ready**
- No errors in the browser console

### Check i18n

Visit these URLs; all should load without errors:

- http://localhost:3000/ar
- http://localhost:3000/fr
- http://localhost:3000/en

### Test Mock ZR Express API

```bash
curl -X POST http://localhost:3000/api/zr-express/tarification \
  -H "Content-Type: application/json" \
  -d '{"wilayaId": 16, "deliveryType": "Domicile"}'
```

Expected response:

```json
{
  "success": true,
  "cost": 350,
  "currency": "DZD",
  "wilayaName": "Alger",
  "deliveryType": "Domicile",
  "weight": 1,
  "note": "Mock API - Replace with real ZR Express endpoint in production"
}
```

## Common Issues & Troubleshooting

### Issue: "Port 3000 is already in use"

**Solution:**

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Issue: Convex schema deployment fails

**Solution:**

```bash
# Delete .convex folder and restart
rm -rf .convex
npx convex dev
```

On Windows (PowerShell):

```powershell
Remove-Item -Recurse -Force .convex
npx convex dev
```

### Issue: Tailwind CSS not working

**Solution:**

- Run `npm run dev` and do a hard refresh in the browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: TypeScript errors in VS Code

**Solution:**

- Restart the TypeScript server: **Cmd+Shift+P** (or Ctrl+Shift+P) → **TypeScript: Restart TS Server**

## Project Structure

```text
gayla-shop/
├── app/                      # Next.js App Router
│   ├── [locale]/             # Internationalized routes
│   ├── api/                  # API routes (ZR Express mock)
│   └── globals.css           # Global styles
├── components/               # React components
│   └── ui/                   # shadcn/ui components
├── convex/                   # Convex backend
│   ├── schema.ts             # Database schema
│   └── tsconfig.json         # Convex TypeScript config
├── docs/                     # Documentation
│   └── SETUP.md              # This file
├── lib/                      # Utilities
├── messages/                 # i18n translations
│   ├── ar.json               # Arabic
│   ├── fr.json               # French
│   └── en.json               # English
├── .env.example              # Environment variables template
├── .env.local                # Local environment (gitignored)
├── i18n.ts                   # Internationalization config
├── middleware.ts             # Next.js middleware (i18n routing)
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Development Workflow

### Running the app

| Terminal 1 | Terminal 2 |
|------------|------------|
| `npx convex dev` (Convex backend) | `npm run dev` (Next.js frontend) |

### Making changes

- **Frontend:** Edit files in `app/` or `components/` — hot reload is automatic.
- **Backend:** Edit files in `convex/` — Convex auto-deploys.
- **Styles:** Edit Tailwind classes — hot reload is automatic.
- **Translations:** Edit `messages/*.json` — restart the dev server to see changes.
