@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo              Prepify Setup
echo ============================================
echo This will install Prepify on your computer
echo and create a desktop shortcut for easy access.
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

:: Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed.
    echo         Download it from https://git-scm.com
    pause
    exit /b 1
)
echo [OK] Git found.

:: Setup directories
set REPO_URL=https://github.com/igagandeep/Prepify.git
set APP_DIR=%USERPROFILE%\Prepify

echo.
echo [INFO] Installing to: %APP_DIR%

:: Clean install
if exist "%APP_DIR%" (
    echo [INFO] Removing existing installation...
    rd /s /q "%APP_DIR%" >nul 2>&1
)

:: Clone fresh copy
echo [INFO] Downloading Prepify...
git clone %REPO_URL% "%APP_DIR%"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to download Prepify.
    pause
    exit /b 1
)

cd /d "%APP_DIR%"

:: Kill any running processes
echo [INFO] Stopping any running processes...
taskkill /F /IM node.exe /T >nul 2>&1

:: Install dependencies
echo [INFO] Installing dependencies (this may take a few minutes)...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

:: Setup database
echo [INFO] Setting up database...
cd backend

:: Create .env file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating backend environment file...
    (
        echo DATABASE_URL=file:./prepify.db
        echo NODE_ENV=development
        echo PORT=5000
    ) > .env
    echo [OK] Environment file created.
)

call npm run db:push
if %errorlevel% neq 0 (
    echo [ERROR] Database setup failed.
    pause
    exit /b 1
)

:: Build backend
echo [INFO] Building backend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed.
    pause
    exit /b 1
)

cd /d "%APP_DIR%"

:: Create start.bat launcher
echo [INFO] Creating launcher...
(
echo @echo off
echo cd /d "%APP_DIR%"
echo echo Starting Prepify...
echo echo Frontend: http://localhost:3000
echo echo Backend:  http://localhost:5000
echo echo.
echo call npm run dev
) > start.bat

:: Create desktop shortcut (.lnk) using VBScript
echo [INFO] Creating desktop shortcut...
set ICON_PATH=%APP_DIR%\frontend\app\favicon.ico
set VBS_FILE=%TEMP%\prepify_shortcut.vbs

echo Set ws = CreateObject("WScript.Shell") > "%VBS_FILE%"
echo Set sc = ws.CreateShortcut(ws.SpecialFolders("Desktop") ^& "\Prepify.lnk") >> "%VBS_FILE%"
echo sc.TargetPath = "%APP_DIR%\start.bat" >> "%VBS_FILE%"
echo sc.WorkingDirectory = "%APP_DIR%" >> "%VBS_FILE%"
echo sc.Description = "Launch Prepify" >> "%VBS_FILE%"
echo sc.IconLocation = "%ICON_PATH%" >> "%VBS_FILE%"
echo sc.Save >> "%VBS_FILE%"

cscript //nologo "%VBS_FILE%" 2>nul

if exist "%USERPROFILE%\Desktop\Prepify.lnk" (
    echo [OK] Desktop shortcut created: Prepify
) else if exist "%USERPROFILE%\OneDrive\Desktop\Prepify.lnk" (
    echo [OK] Desktop shortcut created: Prepify
) else (
    echo [WARNING] Could not create desktop shortcut.
    echo [INFO] You can manually run: %APP_DIR%\start.bat
)

del "%VBS_FILE%" >nul 2>&1

echo.
echo ============================================
echo          Setup Complete!
echo ============================================
echo Prepify has been installed to: %APP_DIR%
echo.
echo To start Prepify:
echo 1. Double-click the Prepify icon on your desktop
echo 2. Or run: %APP_DIR%\start.bat
echo.
echo Press any key to launch Prepify now...
pause >nul

:: Launch Prepify
call start.bat