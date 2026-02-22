import { app, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

let backendProcess: ChildProcess | null = null;

function startBackend() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    // In development, just skip starting backend - user runs it manually
    console.log('Development mode - backend should be started manually');
    return;
  }

  // In production, start the backend using spawn
  const backendPath = path.join(
    process.resourcesPath,
    'backend',
    'dist',
    'index.js',
  );

  if (!fs.existsSync(backendPath)) {
    console.error(`Backend not found at: ${backendPath}`);
    return;
  }

  // Set up database in user data directory
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'prepify.db');

  try {
    // Use spawn instead of utilityProcess.fork for better module resolution
    backendProcess = spawn('node', [backendPath], {
      cwd: path.join(process.resourcesPath, 'backend'),
      env: {
        ...process.env,
        DATABASE_URL: `file:${dbPath}`,
        NODE_ENV: 'production',
        NODE_PATH: path.join(process.resourcesPath, 'backend', 'node_modules'),
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    backendProcess.stdout?.on('data', (data: Buffer) => {
      console.log(`Backend: ${data.toString().trim()}`);
    });

    backendProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`Backend Error: ${data.toString().trim()}`);
    });

    backendProcess.on('exit', (code: number | null) => {
      console.log(`Backend exited with code ${code}`);
      backendProcess = null;
    });

    backendProcess.on('error', (err: Error) => {
      console.error('Failed to start backend process:', err);
      backendProcess = null;
    });

    console.log('Backend started successfully');
  } catch (err) {
    console.error('Failed to start backend:', err);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1500,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    autoHideMenuBar: true,
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    const frontendPath = path.join(
      process.resourcesPath,
      'frontend',
      'index.html',
    );
    if (fs.existsSync(frontendPath)) {
      win.loadFile(frontendPath);
    } else {
      win.loadURL('data:text/html,<h1>Frontend not found</h1>');
    }
  }
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(() => {
    createWindow();
  }, 2000);
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
