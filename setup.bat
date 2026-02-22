@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo              Prepify Setup
echo ============================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo         Download it from https://nodejs.org ^(v20 or higher^)
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js found.

:: Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed.
    echo         Download it from https://git-scm.com
    echo.
    pause
    exit /b 1
)
echo [OK] Git found.

:: Clone or update
set REPO_URL=https://github.com/igagandeep/Prepify.git
set APP_DIR=%USERPROFILE%\Prepify

echo.
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

echo [INFO] Working directory: %CD%
echo.

:: Install dependencies
echo [INFO] Installing dependencies ^(this may take a few minutes^)...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Dependency installation failed. See errors above.
    pause
    exit /b 1
)
echo [OK] Dependencies installed.

:: Create backend .env if missing
if not exist "backend\.env" (
    echo [INFO] Creating backend environment file...
    (
        echo DATABASE_URL=file:./prepify.db
        echo NODE_ENV=development
    ) > backend\.env
    echo [OK] backend\.env created.
)

:: Setup database
echo.
echo [INFO] Setting up database...
cd /d "%APP_DIR%\backend"
call npm run db:push
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Database setup failed. See errors above.
    cd /d "%APP_DIR%"
    pause
    exit /b 1
)
cd /d "%APP_DIR%"
echo [OK] Database ready.

:: Launch
echo.
echo ============================================
echo   Prepify is starting!
echo   Frontend -^> http://localhost:3000
echo   Backend  -^> http://localhost:3001
echo   Press Ctrl+C to stop.
echo ============================================
echo.
call npm run dev

echo.
echo [INFO] Prepify stopped.
pause
