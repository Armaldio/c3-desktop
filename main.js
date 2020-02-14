const {
  app, BrowserWindow, protocol, Menu, MenuItem, session, globalShortcut,
} = require('electron');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { ipcMain } = require('electron');
const serve = require('electron-serve');
const electronLocalshortcut = require('@beaker/electron-localshortcut');
const isDev = require('./isDev');

const loadURL = serve({ directory: 'dist' });

console.log(process.argv);

let mainWindow;

console.log('isDev', isDev);

app.commandLine.appendSwitch('--in-process-gpu');
app.commandLine.appendSwitch('--disable-direct-composition');

autoUpdater.checkForUpdatesAndNotify();

async function createWindow() {
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //     callback({ responseHeaders: Object.assign({
  //             "Content-Security-Policy": [ "default-src 'none'" ]
  //         }, details.responseHeaders)});
  // });

  if (isDev) {
    require('vue-devtools').install();
  }


  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      nodeIntegration: true,
      // nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      nativeWindowOpen: true,
      sandbox: false,
      additionalArguments: [...process.argv.splice(2)],
      devtool: true,
      webviewTag: true,
    },
  });

  /* IPC */
  ipcMain.on('open-dev-tools', (event, arg) => {
    console.log('ok');
    mainWindow.webContents.openDevTools();
    event.reply('open-dev-tools', true);
  });

  ipcMain.on('close-dev-tools', (event, arg) => {
    mainWindow.webContents.closeDevTools();
    event.reply('close-dev-tools', true);
  });

  ipcMain.on('toggle-dev-tools', (event, arg) => {
    mainWindow.webContents.toggleDevTools();
    event.reply('toggle-dev-tools', true);
  });

  app.userAgentFallback = app.userAgentFallback.replace(`Electron/${process.versions.electron}`, '');

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    await loadURL(mainWindow);
    console.log('Running in production environment');
  }

  mainWindow.removeMenu();
  mainWindow.maximize();

  electronLocalshortcut.register(mainWindow, 'F12', () => {
    mainWindow.webContents.toggleDevTools();
  });

  electronLocalshortcut.register(mainWindow, 'CmdOrCtrl+R', () => {
    mainWindow.webContents.send('reload');
  });

  electronLocalshortcut.register(mainWindow, 'CmdOrCtrl+W', () => {
    console.log('Preventing a close on ctrl+w');
  });

  app.on('browser-window-created', (e, window) => {
    console.log('new window created !');

    electronLocalshortcut.register(window, 'F12', () => {
      window.webContents.toggleDevTools();
    });

    electronLocalshortcut.register(window, 'CmdOrCtrl+R', () => {
      window.webContents.reload();
    });

    electronLocalshortcut.register(window, 'CmdOrCtrl+W', () => {
      console.log('Preventing a close on ctrl+w');
    });

    window.removeMenu();
  });

  mainWindow.once('ready-to-show', () => {
    console.log('ready to show');
    mainWindow.show();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.once('ready', () => {
  if (mainWindow) {
    console.log('mainWindow OK');
    const ret = hotkey.register(mainWindow, 'control+b', 'F12');
    console.log('ret', ret);
  }
  // const ret = globalShortcut.register('control+b', () => {
  //   console.log('pressed!');
  // });
  //
  // if (!ret) {
  //   console.log('registration failed');
  // }
});

app.on('aaa', (event) => {
  console.log('F12 received');
  mainWindow.webContents.openDevTools();
});

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', async () => {
  if (mainWindow === null) {
    await createWindow();
  }
});
