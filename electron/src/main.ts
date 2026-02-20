import { app, BrowserWindow } from 'electron'
import { spawn } from 'child_process'
import path from 'path'

let backendProcess: any

function startBackend() {
  console.log('Starting backend server...')
  backendProcess = spawn('node', [
    path.join(__dirname, '../../backend/dist/index.js')
  ], {
    stdio: 'pipe'
  })
  
  backendProcess.stdout.on('data', (data: any) => {
    console.log(`Backend: ${data}`)
  })
  
  backendProcess.stderr.on('data', (data: any) => {
    console.error(`Backend Error: ${data}`)
  })
  
  backendProcess.on('close', (code: any) => {
    console.log(`Backend process exited with code ${code}`)
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1500,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Hide the menu bar
    autoHideMenuBar: true,
    // Or completely remove it (uncomment next line instead)
    // frame: false,
  })

  // Always load Next.js dev server for now (since frontend is running)
  win.loadURL('http://localhost:3000')
  
  // Open DevTools to see any errors
  win.webContents.openDevTools()
}

app.whenReady().then(() => {
  startBackend()
  createWindow()
})

app.on('before-quit', () => {
  backendProcess?.kill()
})