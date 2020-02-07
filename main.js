const {
  app, BrowserWindow, protocol, Menu, MenuItem, session,
} = require('electron');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { ipcMain } = require('electron');
const serve = require('electron-serve');
const isDev = require('./isDev');


const loadURL = serve({ directory: 'dist' });


console.log(process.argv);

let mainWindow;

console.log('isDev', isDev);

app.commandLine.appendSwitch('--in-process-gpu');
app.commandLine.appendSwitch('--disable-direct-composition');

process.on('uncaughtException', (err) => {
  // log the message and stack trace
  fs.writeFileSync('crash.log', `${err}\n${err.stack}`);

  // do any cleanup like shutting down servers, etc

  // relaunch the app (if you want)
  app.relaunch({ args: [] });
  app.exit(0);
});

process.on('SIGTERM', () => {
  fs.writeFileSync('shutdown.log', 'Received SIGTERM signal');

  // do any cleanup like shutting down servers, etc

  // relaunch the app (if you want)
  app.relaunch({ args: [] });
  app.exit(0);
});

// Menu.setApplicationMenu(null);

autoUpdater.checkForUpdatesAndNotify();

async function createWindow() {
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //     callback({ responseHeaders: Object.assign({
  //             "Content-Security-Policy": [ "default-src 'none'" ]
  //         }, details.responseHeaders)});
  // });


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

  app.userAgentFallback = app.userAgentFallback.replace(`Electron/${process.versions.electron}`, '');
  // app.allowRendererProcessReuse = true;

  const defaultMenu = Menu.getApplicationMenu();
  const menu = Menu.buildFromTemplate(defaultMenu.items);

  menu.append(new MenuItem({
    label: 'Construct 3',
    submenu: [
      {
        role: 'toggleDevTools',
        accelerator: 'F12',
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click() {
          mainWindow.webContents.send('reload');
        },
      },
      {
        label: 'Prevent close',
        accelerator: 'CmdOrCtrl+W',
        click: () => {
          console.log('Preventing a close on ctrl+w');
        },
      },
    ],
  }));
  menu.append(new MenuItem({}));
  mainWindow.setMenu(menu);

  // mainWindow.loadURL('https://editor.construct.net');
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    await loadURL(mainWindow);
    console.log('Running in production environement');

    mainWindow.removeMenu();
  }

  mainWindow.maximize();

  app.on('browser-window-created', (e, window) => {
    console.log('new window created !');

    window.setMenu(menu);

    if (!isDev) {
      window.removeMenu();
    }
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
