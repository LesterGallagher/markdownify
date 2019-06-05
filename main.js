const { app, BrowserWindow, protocol, ipcMain, shell } = require('electron')
const path = require('path');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const isDev = require('electron-is-dev');
const { createMenu } = require('./menu');
require('./contextmenu');

autoUpdater.checkForUpdatesAndNotify()
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

ipcMain.on('save', async (event, arg) => {
    const { id } = arg;
    event.sender.send('save-response', { id });
})


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'public/icon.png'),
        show: false,
        frame: false,
        backgroundColor: '#fff',
        webPreferences: {
            nodeIntegration: true
        }
    });

    const { webContents } = win;

    var handleRedirect = (e, url) => {
        if (url != webContents.getURL()) {
            e.preventDefault();
            shell.openExternal(url);
        }
    }
    
    webContents.on('will-navigate', handleRedirect)
    webContents.on('new-window', handleRedirect)

    createMenu(win);

    win.maximize();
    win.show();

    // and load the index.html of the app.
    win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './build/index.html')}`);
    if (isDev) {
        // Open the DevTools.
        //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
        win.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.