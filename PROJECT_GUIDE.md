# Prepify - Project Guide for AI Agents

## 🎯 Project Overview

**Prepify** is a career-focused desktop application featuring:

- AI-powered resume analyzer
- Job application tracking
- Mock interviews with AI

## 🏗️ Architecture

This is a **3-tier desktop application** using:

### Frontend (Web UI)

- **Technology**: Next.js 16.1.6 + React 19 + TypeScript
- **Location**: `./frontend/`
- **Port**: 3000 (development)

### Backend (API Server)

- **Technology**: Express.js + TypeScript + Prisma + SQLite
- **Location**: `./backend/`
- **Port**: 3001

### Electron (Desktop Wrapper)

- **Technology**: Electron + TypeScript
- **Location**: `./electron/`
- **Main File**: `electron/src/main.ts`

## 📁 Project Structure

```
Prepify/
├── frontend/           # Next.js web application
├── backend/           # Express.js API server with Prisma
├── electron/          # Electron desktop wrapper
└── .vscode/           # VS Code workspace settings
```

## 🔄 Application Flow

1. **Electron** starts the desktop application
2. **Backend** server is spawned as a child process
3. **Frontend** is loaded in the Electron window
4. **Frontend** communicates with **Backend** via HTTP APIs

## 🚀 Development Workflow

### Initial Setup

```bash
npm install  # Install all dependencies
```

### Development Mode

```bash
npm run dev  # Start all services
```

### Production Build

```bash
npm run build  # Build all workspaces
```

## 🛠️ Best Practices for AI Agents

### Code Quality

- Use TypeScript for type safety
- Use `getDiagnostics` tool to check for errors
- Prefer `readCode` over `readFile` for code analysis

### File Operations

- Use `editCode` for AST-based code modifications
- Use `semanticRename` for renaming symbols
- Use `smartRelocate` for moving files
- Always check diagnostics after changes

### Database Operations

- Uses Prisma with SQLite
- Simple User model with just username
- Database files are in `backend/prisma/`

## 🚨 Common Pitfalls

- Don't use long-running commands in shell execution
- File paths need correct resolution across environments
- This is a monorepo with npm workspaces

## 🎯 Current Status

- ✅ Project structure established
- ✅ Electron main process configured (no menu bar)
- ✅ Frontend Next.js setup with Prettier
- ✅ Backend Express + Prisma setup
- ✅ Simple User model (id, username, timestamps)
- ✅ VS Code workspace settings configured

## 📞 Quick Commands

```bash
# Development
npm run dev                    # Start all services

# Building
npm run build                  # Build all

# Electron specific
cd electron && npm run start   # Run built Electron app

# Database
cd backend && npm run db:studio  # Open Prisma Studio
```

---

**Important**: Only comment code when absolutely necessary. Keep comments minimal and focus on complex business logic only.
