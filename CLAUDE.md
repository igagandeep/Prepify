# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Prepify** is a career-focused desktop application with three features: AI-powered resume analyzer, job application tracking, and mock interviews with AI.

## Architecture

This is a **3-tier monorepo desktop application** using npm workspaces:

```
Electron (desktop shell)
  └─ spawns → Backend (Express @ :3001)
  └─ loads  → Frontend (Next.js @ :3000 dev / static HTML prod)
```

- **[frontend/](frontend/)** — Next.js 16 + React 19 + TypeScript + Tailwind CSS 4. Configured for static export (`output: 'export'`). In production, loads as static HTML from bundled resources.
- **[backend/](backend/)** — Express.js 5 + TypeScript + Prisma 6 + SQLite. REST API on port 3001. Database at `backend/prepify.db`.
- **[electron/](electron/)** — Electron 28 desktop wrapper. Main process in [electron/src/main.ts](electron/src/main.ts) spawns the backend as a child process and creates the BrowserWindow.

The Electron main process detects dev vs. production:
- **Dev**: Backend loaded from `../../backend/dist/index.js`; window loads `http://localhost:3000`
- **Prod**: Backend loaded from `process.resourcesPath/backend/index.js`; window loads bundled static HTML

## Commands

### Root (run from repo root)
```bash
npm install          # Install all workspace dependencies
npm run dev          # Start all three services concurrently
npm run build        # Build all workspaces
npm run build:prod   # Production build (backend + static frontend export + electron)
npm run clean        # Clean all build artifacts
```

### Distribution
```bash
npm run test:build   # Verify build process
npm run dist         # Create distributable packages (all platforms)
npm run dist:win     # Windows executable only
npm run pack         # Package without installer
```
Output goes to `electron/dist-electron/`.

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
npm run db:generate  # Regenerate Prisma client
npm run db:push      # Push schema changes to SQLite
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio UI
```

### Electron (from `electron/`)
```bash
npm run dev          # Build + launch Electron app
npm run build        # TypeScript compilation only
npm run start        # Run pre-built app
```

## Database

Prisma + SQLite. Schema at [backend/prisma/schema.prisma](backend/prisma/schema.prisma). Currently a minimal `User` model (id, username, timestamps) intended to be extended with resume, job application, and interview data.

After modifying the schema, run `npm run db:push` (dev) or `npm run db:migrate` (migrations).

## CI/CD

- **`.github/workflows/build-development.yml`** — Triggered on push to `development` branch; builds on Windows, Ubuntu, macOS in parallel, uploads artifacts.
- **`.github/workflows/build.yml`** — Triggered on version tags (`v*`) or manual dispatch; release builds for all platforms.

## Key Notes

- `electron/src/main.ts` sets `webSecurity: false` to allow loading local CSS/JS — keep this in mind when adding resource loading.
- Only comment code when absolutely necessary; focus comments on complex business logic only.
- File path resolution differs between dev and production Electron environments — always test both when modifying how resources are loaded.
- `--legacy-peer-deps` is required in CI for dependency installation (React 19 peer dep conflicts).
