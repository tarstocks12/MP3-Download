const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
    title: 'SonicConvert'
  });

  // Start the local Express backend as a child process
  const serverPath = path.join(__dirname, 'dist', 'server.cjs');
  serverProcess = fork(serverPath, [], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '3000' }
  });

  // Load the web application once the server is likely up
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 1500);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Ensure the backend Express server is closed when exiting the application
  if (serverProcess) {
    serverProcess.kill();
  }
});
