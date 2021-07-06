const electron = require('electron');
const { app, Menu, dialog, ipcMain } = electron;
const { openFile, htmlExtensions, markdownExtensions, txtExtensions } = require('./files');

exports.createMenu = win => {
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open',
                    click: async () => {
                        const { filePaths  } = await dialog.showOpenDialog({
                            properties: ['openFile'],
                            filters: [
                                { name: 'Markdown', extensions: markdownExtensions },
                                { name: 'HTML', extensions: htmlExtensions },
                                { name: 'Text', extensions: txtExtensions },
                                { name: 'All', extensions: ['*'] },
                            ]
                        })
                        console.log('open file', filePaths)
                        if(filePaths.length <= 0) return;
                        const [filename] = filePaths;
                        await openFile(win, filename);
                    }
                },
                {
                    label: 'Save',
                    click: () => {
                        win.webContents.send('save');
                    }
                },
                {
                    label: 'Exit',
                    click: () => app.quit()
                }
            ]
        },
        {
            label: 'Format',
            submenu: [
                {
                    label: 'Font',
                    click: () => {
                        win.webContents.send('app-state-change', { hideFontDialog: false });
                    }
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

