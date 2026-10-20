const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function crearVentana () {
  const ventana = new BrowserWindow({
    width: 1280,
    height: 850,
    title: "ScentDream", // ¡Nuevo nombre de tu aplicación!
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (app.isPackaged) {
    ventana.loadFile(path.join(__dirname, 'dist', 'index.html'));
    autoUpdater.checkForUpdatesAndNotify(); 
  } else {
    ventana.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(crearVentana);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});