@echo off
echo ============================================
echo              Prepify Setup
echo ============================================
echo This will install Prepify and create a
echo desktop shortcut for easy access.
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

:: Install dependencies
echo [INFO] Installing dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Installation failed.
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
call npm run build
cd ..

:: Create desktop shortcut (.lnk) using VBScript
echo [INFO] Creating desktop shortcut...
set CURRENT_DIR=%CD%
set ICON_PATH=%CURRENT_DIR%\frontend\app\favicon.ico
set VBS_FILE=%TEMP%\prepify_shortcut.vbs

echo Set ws = CreateObject("WScript.Shell") > "%VBS_FILE%"
echo Set sc = ws.CreateShortcut(ws.SpecialFolders("Desktop") ^& "\Prepify.lnk") >> "%VBS_FILE%"
echo sc.TargetPath = "%CURRENT_DIR%\start.bat" >> "%VBS_FILE%"
echo sc.WorkingDirectory = "%CURRENT_DIR%" >> "%VBS_FILE%"
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
    echo [INFO] You can manually run: %CURRENT_DIR%\start.bat
)

del "%VBS_FILE%" >nul 2>&1

echo.
echo ============================================
echo          Setup Complete!
echo ============================================
echo.
echo To start Prepify, double-click the Prepify
echo icon on your desktop or run start.bat
echo.
echo Press any key to launch Prepify now...
pause >nul

call start.bat