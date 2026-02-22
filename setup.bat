@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo              Prepify Setup
echo ============================================
echo.

:: ── Check Node.js ───────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo         Download it from https://nodejs.org ^(v20 or higher^)
    echo.
    pause
    exit /b 1
)

:: ── Check Git ───────────────────────────────
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed.
    echo         Download it from https://git-scm.com
    echo.
    pause
    exit /b 1
)

:: ── Clone or update ─────────────────────────
set REPO_URL=https://github.com/igagandeep/Prepify.git
set APP_DIR=%USERPROFILE%\Prepify

if exist "%APP_DIR%\.git" (
    echo [INFO] Prepify already exists. Pulling latest changes...
    cd /d "%APP_DIR%"
    git pull
) else (
    echo [INFO] Cloning Prepify into %APP_DIR%...
    git clone %REPO_URL% "%APP_DIR%"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to clone repository.
        pause
        exit /b 1
    )
    cd /d "%APP_DIR%"
)

:: ── Install dependencies ─────────────────────
echo.
echo [INFO] Installing dependencies...
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
)

:: ── Backend .env ─────────────────────────────
if not exist "backend\.env" (
    echo [INFO] Creating backend environment file...
    (
        echo DATABASE_URL=file:./prepify.db
        echo NODE_ENV=development
    ) > backend\.env
)

:: ── Database setup ───────────────────────────
echo.
echo [INFO] Setting up database...
cd backend
npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Database setup failed.
    cd ..
    pause
    exit /b 1
)
cd ..

:: ── Launch ───────────────────────────────────
echo.
echo ============================================
echo   Prepify is starting!
echo.
echo   Frontend → http://localhost:3000
echo   Backend  → http://localhost:3001
echo.
echo   Press Ctrl+C to stop.
echo ============================================
echo.
npm run dev
