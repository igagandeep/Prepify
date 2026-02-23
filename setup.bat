@echo off
echo ============================================
echo              Prepify Setup
echo ============================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo         Download it from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found.

:: Kill any running processes
echo [INFO] Stopping any running processes...
taskkill /F /IM node.exe /T >nul 2>&1
echo [OK] Processes stopped.

:: Install dependencies
echo [INFO] Installing dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Installation failed.
    pause
    exit /b 1
)
echo [OK] Dependencies installed.

:: Build backend
echo [INFO] Building backend...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed.
    pause
    exit /b 1
)
cd ..
echo [OK] Backend built.

echo.
echo ============================================
echo   Setup complete!
echo   Run start.bat to launch Prepify.
echo ============================================
echo.

:: Launch the app right away after setup
call start.bat
