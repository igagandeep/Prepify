import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

let backendProcess: any;

function startBackend() {
  console.log('Starting backend server...');

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const backendPath = isDev
    ? path.join(__dirname, '../../backend/dist/index.js')
    : path.join(process.resourcesPath, 'backend', 'index.js');

  // Check if backend file exists
  if (!fs.existsSync(backendPath)) {
    console.log('Backend not built yet, skipping backend start in development');
    return;
  }

  backendProcess = spawn('node', [backendPath], {
    stdio: 'pipe',
  });

  backendProcess.stdout.on('data', (data: any) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data: any) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code: any) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1500,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(process.resourcesPath, 'frontend', 'index.html'));
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('before-quit', () => {
  backendProcess?.kill();
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
