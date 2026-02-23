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

:: Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed.
    echo         Download it from https://git-scm.com
    pause
    exit /b 1
)
echo [OK] Git found.

:: Clone or update repository
set REPO_URL=https://github.com/igagandeep/Prepify.git
set APP_DIR=%USERPROFILE%\Prepify

if exist "%APP_DIR%\.git" (
    echo [INFO] Updating Prepify...
    cd /d "%APP_DIR%"
    git pull
) else (
    echo [INFO] Downloading Prepify...
    git clone %REPO_URL% "%APP_DIR%"
    cd /d "%APP_DIR%"
)

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

:: Create desktop shortcut to start.bat
echo [INFO] Creating desktop shortcut...
set START_BAT=%APP_DIR%\start.bat

powershell -Command "$desktop = [Environment]::GetFolderPath('Desktop'); $ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut(\"$desktop\Prepify.lnk\"); $s.TargetPath = '%START_BAT%'; $s.WorkingDirectory = '%APP_DIR%'; $s.Description = 'Launch Prepify'; $s.Save()"
if %errorlevel% equ 0 (
    echo [OK] Desktop shortcut created! Use it to launch Prepify anytime.
) else (
    echo [INFO] Could not create shortcut. You can run start.bat from:
    echo         %APP_DIR%\start.bat
)

echo.
echo ============================================
echo   Setup complete!
echo.
echo   To launch Prepify in the future:
echo     - Double-click the "Prepify" shortcut on your Desktop
echo     - Or run: %APP_DIR%\start.bat
echo ============================================
echo.

:: Launch the app right away
cd /d "%APP_DIR%"
call "%APP_DIR%\start.bat"
