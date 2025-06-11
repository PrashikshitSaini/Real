const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Ensure the entries directory exists
const entriesDir = path.join(app.getPath('userData'), 'entries');
if (!fs.existsSync(entriesDir)) {
  fs.mkdirSync(entriesDir, { recursive: true });
}

let mainWindow; // Make mainWindow accessible globally

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setMenuBarVisibility(false);

  // In development, load from React dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built React app
    mainWindow.loadFile(path.join(__dirname, 'src', 'build', 'index.html'));
  }
}

app.whenReady().then(createWindow);

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

// IPC handlers for file operations
ipcMain.handle('save-entry', async (event, { content, metadata, filename }) => {
  if (!content.trim()) return { success: false, reason: 'Empty content' };
  let targetFilename = filename;
  let typingSeconds = metadata.typingSeconds || 0;
  if (targetFilename) {
    // If updating, try to preserve typingSeconds if not provided
    const filepath = path.join(entriesDir, targetFilename);
    if (fs.existsSync(filepath)) {
      const oldContent = fs.readFileSync(filepath, 'utf-8');
      const match = oldContent.match(/typingSeconds:\s*(\d+)/);
      if (match && !metadata.typingSeconds) {
        typingSeconds = parseInt(match[1], 10);
      }
    }
  }
  if (!targetFilename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    targetFilename = `entry_${timestamp}.md`;
  }
  const filepath = path.join(entriesDir, targetFilename);

  const entryContent = `---\ntimestamp: ${new Date().toISOString()}\nfont: ${metadata.font}\ncolor: ${metadata.color}\ntypingSeconds: ${typingSeconds}\n---\n\n${content}`;

  fs.writeFileSync(filepath, entryContent);
  return { success: true, filename: targetFilename };
});

ipcMain.handle('load-entries', async () => {
  const files = fs.readdirSync(entriesDir);
  return files.map(filename => {
    const content = fs.readFileSync(path.join(entriesDir, filename), 'utf-8');
    return { filename, content };
  });
});

ipcMain.handle('delete-entry', async (event, { filename }) => {
  if (!filename) return { success: false, reason: 'No filename provided' };
  const filepath = path.join(entriesDir, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return { success: true };
  }
  return { success: false, reason: 'File not found' };
});

ipcMain.on('set-fullscreen', (event, shouldBeFullscreen) => {
  if (mainWindow) {
    mainWindow.setFullScreen(shouldBeFullscreen);
  }
});

ipcMain.on('app-quit', () => {
  app.quit();
}); 