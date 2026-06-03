const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const { startWebSocketServer, getLocalIP } = require('./websocket.cjs');

let mainWindow;

const isDev = !app.isPackaged;

// 1. SINGLE INSTANCE LOCK
// Ensures only one instance of DALYRIC runs at a time to prevent local DB conflicts
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // If a second instance is launched, focus the active main window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // App bootstrap initiation
  app.whenReady().then(() => {
    const pin = process.env.REMOTE_PIN || '1234';
    const serverInstance = startWebSocketServer(pin, 3002);
    const localIp = serverInstance ? serverInstance.localIp : getLocalIP();
    const interfacesJson = serverInstance ? JSON.stringify(serverInstance.interfaces) : JSON.stringify([{ name: 'Wi-Fi', address: localIp, isVirtual: false }]);

    createMainWindow(localIp, pin, interfacesJson);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow(localIp, pin, interfacesJson);
      }
    });
  });
}

function createMainWindow(localIp, pin, interfacesJson) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'DaLyric',
    icon: path.join(__dirname, '../app_icon.png'), // Beautiful custom branding taskbar/window icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Permits rendering local media loops & IndexedDB caches
    }
  });

  // Hide the default browser window menu bar
  mainWindow.removeMenu();

  // Inject Local IP and active PIN to window local storage for pairing QR Display
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      localStorage.setItem("desktop_local_ip", "${localIp}");
      localStorage.setItem("desktop_local_ips", '${interfacesJson}');
      localStorage.setItem("remote_pin", "${pin}");
      window.dispatchEvent(new Event('storage'));
    `).catch(err => console.error('Failed to sync network info to localStorage:', err));
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://127.0.0.1:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 2. TACTILE DESKTOP ACCELERATOR SYSTEM
  // Injects native support for zooming, hard-reloading, and borderless fullscreen toggling
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const key = input.key.toLowerCase();
    
    // Ctrl + '+' / '=' -> Zoom In
    if (input.control && (key === '=' || key === '+')) {
      mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5);
      event.preventDefault();
    }
    // Ctrl + '-' -> Zoom Out
    if (input.control && key === '-') {
      mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5);
      event.preventDefault();
    }
    // Ctrl + '0' -> Reset Zoom to default
    if (input.control && key === '0') {
      mainWindow.webContents.setZoomLevel(0);
      event.preventDefault();
    }
    // F11 -> Toggle Studio Window Fullscreen
    if (key === 'f11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
    // Ctrl + R -> Refresh app state
    if (input.control && key === 'r') {
      mainWindow.webContents.reloadIgnoringCache();
      event.preventDefault();
    }
  });

  // 3. MULTI-MONITOR POPUP COORDINATOR
  // Uses Electron's native screen module to detect external displays and positions
  // the projection window on the extended (TV) monitor in borderless fullscreen
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const displays = screen.getAllDisplays();

    // Find the external/secondary display (the one that's NOT the primary)
    const primary = screen.getPrimaryDisplay();
    const externalDisplay = displays.find(d => d.id !== primary.id);
    // Fallback: not at origin, or last display
    const secondary = externalDisplay
      || displays.find(d => d.bounds.x !== primary.bounds.x || d.bounds.y !== primary.bounds.y)
      || displays[displays.length - 1]
      || null;

    const target = secondary || displays[0];

    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        x: target.bounds.x,
        y: target.bounds.y,
        width: target.bounds.width,
        height: target.bounds.height,
        frame: false,
        fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
          webSecurity: false,
          nodeIntegration: false,
          contextIsolation: true
        }
      }
    };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
