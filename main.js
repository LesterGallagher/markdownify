const { app, BrowserWindow, protocol, ipcMain, shell } = require('electron')
const path = require('path');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const isDev = require('electron-is-dev');
const { createMenu } = require('./menu');
const { openFile, currentlyOpenFile } = require('./files');
require('./contextmenu');
const fs = require('fs-extra');
const http = require('http')
const mimeTypes = require('mime-types')
const { Readable } = require("stream")

autoUpdater.checkForUpdatesAndNotify()
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

ipcMain.on('save', async (event, arg) => {
    const { id } = arg;
    event.sender.send('save-response', { id });
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;


ipcMain.on('get-opened-file-data', async event => {
    // get file path to file which was opened with markdownify
    if (process.platform === 'win32' && process.argv.length >= 2) {
        const filename = process.argv[1];

        if ((await fs.exists(filename)) === false) return;

        if ((await fs.stat(filename)).isFile() === false) return;

        console.log('opening file', filename);
        await openFile(win, filename);
    }
});

ipcMain.on('open-file', async (event, { filename }) => {
    // get file path to file which was opened with markdownify

    if ((await fs.exists(filename)) === false) return;

    if ((await fs.stat(filename)).isFile() === false) return;

    console.log('opening file', filename);
    await openFile(win, filename);
});

ipcMain.on('load-default-file', async event => {
    const filename = path.join(__dirname, 'README.md');
    const buffer = await fs.readFile(filename);
    const markdown = buffer.toString();
    win.webContents.send('load-file-as-markdown', { filename, markdown });
});

ipcMain.on('upload-image', async (event, { filename }) => {
    const relativeBase = currentlyOpenFile()
    const url = path.relative(relativeBase, filename).replace(/\\\\/g, '/')
    console.log('uploaded image', filename, url)
    win.webContents.send('uploaded-image', { filename, url });
})

ipcMain.on('save-file', async (event, { markdown }) => {
    await fs.writeFile(currentlyOpenFile(), markdown)
})

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'public/icon.png'),
        show: false,
        frame: false,
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    const { webContents } = win;

    var handleRedirect = (e, url) => {
        if (url !== webContents.getURL()) {
            e.preventDefault();
            shell.openExternal(url);
        }
    }

    webContents.on('will-navigate', handleRedirect);
    webContents.on('new-window', handleRedirect);

    createMenu(win);

    win.maximize();
    win.show();

    const startUrl = 'file:///index.html'

    protocol.interceptStreamProtocol('file', async (request, callback) => {
        try {
            const url = request.url.substr(8)
            const resultPath = path.join(__dirname, 'build', url)
            const newUrl = new URL(url, 'http://localhost:3000')
            console.log(url, 'to', resultPath, '|', newUrl.href)

            const mime = mimeTypes.lookup(request.url)
            const isImage = mime.startsWith('image/')
            const baseFile = currentlyOpenFile()

            console.log('isImage', isImage, 'baseFile', baseFile)

            if (isImage && baseFile) {
                const dirname = path.dirname(baseFile)
                const possiblePath = path.resolve(dirname, url)
                console.log(possiblePath)
                const isFile = (await fs.exists(possiblePath)) &&
                    (await fs.stat(possiblePath)).isFile() === true

                if (isFile) {
                    callback({
                        statusCode: 200,
                        headers: {
                            'content-type': mime
                        },
                        data: fs.createReadStream(possiblePath)
                    })
                    return
                }
            }

            if (isDev) {
                http.get(newUrl.href, response => {
                    callback({
                        statusCode: 200,
                        headers: {
                            ...response.headers
                        },
                        data: response
                    })
                })
            } else {
                callback({
                    statusCode: 200,
                    headers: {
                        'content-type': mime
                    },
                    data: fs.createReadStream(resultPath)
                })
            }
        } catch (err) {
            console.error(err)
            callback({
                statusCode: 500,
                headers: {
                    'content-type': 'text/html'
                },
                data: Readable.from(['internal server error'])
            })
        }
    }, console.error)

    // and load the index.html of the app.
    // win.loadURL(isDev ? 'http://localhost:3000/index.html' : `file://${path.join(__dirname, './build/index.html')}`);
    win.loadURL(startUrl);
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
        win = null;
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