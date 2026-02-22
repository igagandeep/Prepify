# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Prepify** is a career-focused web application with three features: AI-powered resume analyzer, job application tracking, and mock interviews with AI.

## Architecture

This is a **2-tier monorepo web application** using npm workspaces:

```
Frontend (Next.js @ :3000)  →  Backend (Express @ :3001)
```

- **[frontend/](frontend/)** — Next.js 16 + React 19 + TypeScript + Tailwind CSS 4. Static export (`output: 'export'`). Deployed on Vercel.
- **[backend/](backend/)** — Express.js 5 + TypeScript + Prisma 6 + SQLite. REST API on port 3001. Database at `backend/prepify.db`. Deployed on Render.

### Frontend Routing

Proper Next.js page-based routing with a `(app)` route group for the shared sidebar layout:

```
/                → Marketing homepage (demo/hosted only) or redirect to /dashboard (local)
/welcome         → First-time name entry
/dashboard       → Overview dashboard
/jobs            → Job Tracker (Kanban board)
/resume          → Resume Analysis (coming soon)
/interview       → Mock Interview (coming soon)
```

### Local vs Demo Detection

- `NEXT_PUBLIC_APP_MODE=demo` — set in Vercel env vars for the hosted/demo version
- When not set (local dev): skip marketing page, redirect straight to `/welcome` or `/dashboard`
- Demo seed data (10 sample jobs) auto-loads only when `NEXT_PUBLIC_APP_MODE=demo` and jobs list is empty

## Commands

### Root (run from repo root)
```bash
npm install          # Install all workspace dependencies
npm run dev          # Start backend + frontend concurrently
npm run build        # Build backend + frontend
npm run clean        # Clean all build artifacts
```

### Frontend (from `frontend/`)
```bash
npm run dev          # Next.js dev server on :3000
npm run build        # Build + static export
npm run lint         # ESLint
npm run format       # Prettier format
npm run format:check # Prettier check (CI)
```

### Backend (from `backend/`)
```bash
npm run dev          # Build + run server on :3001
npm run build        # prisma generate + tsc
npm run start        # Run compiled server
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema changes to SQLite
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio UI
```

## Database

Prisma + SQLite. Schema at [backend/prisma/schema.prisma](backend/prisma/schema.prisma). Models: `User`, `JobApplication`.

After modifying the schema, run `npm run db:push` (dev) or `npm run db:migrate` (migrations).

## Deployment

- **Frontend** — Vercel (static export). Set `NEXT_PUBLIC_API_URL` to Render backend URL and `NEXT_PUBLIC_APP_MODE=demo`.
- **Backend** — Render. Build command: `npm install --include=dev && npm run build`. Start command: `npx prisma db push && node dist/index.js`. Set `DATABASE_URL=file:./prepify.db`, `ALLOWED_ORIGINS=<vercel-frontend-url>`.

## CI/CD

- **`.github/workflows/build-development.yml`** — Triggered on push to `development` branch; builds backend + frontend on Ubuntu.

## Key Notes

- `--legacy-peer-deps` is required in CI for dependency installation (React 19 peer dep conflicts).
- Only comment code when absolutely necessary; focus comments on complex business logic only.
- Primary brand color: `#3948CF` (indigo/blue).
- CORS is configured via `ALLOWED_ORIGINS` env var on the backend.
