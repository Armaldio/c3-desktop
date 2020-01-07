const {app, BrowserWindow, protocol} = require('electron');
const fs = require('fs');
const {autoUpdater} = require("electron-updater");
const path = require('path');

console.log(process.argv);

let mainWindow;

const isProd = process.env.NODE_ENV === "production";

app.commandLine.appendSwitch("--in-process-gpu");
app.commandLine.appendSwitch("--disable-direct-composition");

process.on('uncaughtException', function (err) {
    //log the message and stack trace
    fs.writeFileSync('crash.log', err + "\n" + err.stack);

    //do any cleanup like shutting down servers, etc

    //relaunch the app (if you want)
    app.relaunch({args: []});
    app.exit(0);
});

process.on('SIGTERM', function () {
    fs.writeFileSync('shutdown.log', "Received SIGTERM signal");

    //do any cleanup like shutting down servers, etc

    //relaunch the app (if you want)
    app.relaunch({args: []});
    app.exit(0);
});

// Menu.setApplicationMenu(null);

autoUpdater.checkForUpdatesAndNotify();

async function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
            nodeIntegration: true,
            // nodeIntegrationInWorker: true,
            // nodeIntegrationInSubFrames: true,
            nativeWindowOpen: true,
            sandbox: false,
            additionalArguments: [...process.argv.splice(2)]
        },
    });

    app.userAgentFallback = app.userAgentFallback.replace('Electron/' + process.versions.electron, '');

    mainWindow.loadURL('https://editor.construct.net');
    if (!isProd) {
        mainWindow.removeMenu();
        mainWindow.webContents.openDevTools();
    }
    mainWindow.maximize();

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', async function () {
    if (mainWindow === null) {
        await createWindow();
    }
});
