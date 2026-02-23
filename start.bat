@echo off
echo ============================================
echo              Prepify
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

:: Kill any running node processes to free ports
echo [INFO] Stopping any running processes...
taskkill /F /IM node.exe /T >nul 2>&1

echo.
echo ============================================
echo   Prepify is starting!
echo   Frontend -^> http://localhost:3000
echo   Backend  -^> http://localhost:5000
echo   Press Ctrl+C to stop.
echo ============================================
echo.

call npm run dev

echo.
echo [INFO] Prepify stopped.
pause
