# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Full-stack web app for a Thai stone kitchenware storefront (ครกหินไทย) with a public storefront and authenticated backoffice CMS. React frontend + Express backend + PostgreSQL (Supabase).

## Commands

```bash
npm run dev          # Run frontend + backend concurrently (dev mode)
npm run dev:client   # Frontend only (Vite HMR on port 5173)
npm run dev:server   # Backend only (tsx watch on port 4000)
npm run db:setup     # Initialize DB schema and seed data
npm run build        # Typecheck all three tsconfigs then Vite build
npm run typecheck    # tsc --noEmit for app + node + server tsconfigs
npm run lint         # ESLint
npm run test         # vitest run (all tests)
npm start            # Production server
```

Run a single test file: `npx vitest run server/tests/app.test.ts`

## Architecture

### Frontend (`src/`)
- Entry: `main.tsx` → `App.tsx` → `src/app/AppRoot.tsx` (BrowserRouter)
- Three routes: `/` (StorefrontPage), `/admin/login` (LoginPage), `/admin` (BackofficePage)
- Auth state: React Context in `src/shared/auth/AuthProvider.tsx` + localStorage via `authStorage.ts`
- API calls: typed fetch wrapper in `src/shared/api/client.ts`
- Types: `src/shared/types/content.ts`
- Env vars: `src/shared/config/env.ts` (reads `VITE_*` vars)

### Backend (`server/`)
- Entry: `index.ts` → `app.ts` (Express app)
- Layer pattern: routes → services → repositories → db pool
- `server/db/init.ts` auto-creates schema and seeds on startup
- Auth: PASETO V3 tokens (12h expiry) via `authService.ts`; password hashing with Argon2
- Google OAuth2: ID token verification in `googleAuthService.ts`
- Validation: Zod on all inputs; `server/config/env.ts` validates all env vars at startup

### API Routes
- `GET /api/health`
- `POST /api/auth/login` — username/password
- `POST /api/auth/google` — Google ID token
- `GET /api/auth/me` — requires Bearer token
- `GET /api/public/content` — no auth
- `GET /api/admin/content` — requires auth
- `PUT /api/admin/content` — replaces entire content atomically, requires auth

### Database (PostgreSQL via Supabase)
Tables: `site_content`, `site_stats`, `features`, `products`, `testimonials`, `social_links`, `admin_users`. `PUT /api/admin/content` does a full atomic replacement. `sort_order` field controls display ordering on collection tables.

### TypeScript Configuration
Three separate tsconfigs: `tsconfig.app.json` (frontend, ES2022), `tsconfig.node.json` (Vite config, ES2023), `tsconfig.server.json` (backend, ES2023). All use strict mode with `noUnusedLocals` and `noUnusedParameters`.

### Dev Proxy
Vite proxies `/api` → `http://localhost:4000` during development, so the frontend makes calls to its own origin and they forward to Express.

## Environment Variables

Copy `.env.example` to `.env`. Key vars:
- `PORT`, `DB_*`, `DB_SSL=true` — PostgreSQL connection (Supabase)
- `PASETO_SECRET` — must be ≥32 chars random string
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_DISPLAY_NAME` — seeded admin account
- `GOOGLE_CLIENT_ID` / `GOOGLE_ALLOWED_EMAILS` — Google OAuth (comma-separated allowed emails; empty = allow all verified)
- `VITE_API_URL` / `VITE_GOOGLE_CLIENT_ID` — frontend-visible vars (must be prefixed `VITE_`)
