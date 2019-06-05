const electron = require('electron');
const { app, BrowserWindow, Menu, dialog, ipcRenderer } = electron;
const path = require('path');
const turndown = require('./turndown');
const fs = require('fs-extra');

const markdownExtensions = [
    'markdown',
    'mdown',
    'mkdn',
    'md',
    'mkd',
    'mdwn',
    'mdtxt',
    'mdtext',
    'text',
    'Rmd'
];

const htmlExtensions= [
    'html',
    'htm',
    'xhtml',
    'dhtml',
    'phtml',
    'jhtml',
    'mhtml',
    'rhtml',
    'shtml',
    'zhtml',
];

exports.createMenu = win => {
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open',
                    click: () => {
                        dialog.showOpenDialog({
                            properties: ['openFile'],
                            filters: [
                                { name: 'Markdown', extensions: markdownExtensions },
                                { name: 'HTML', extensions: htmlExtensions },
                            ]
                        }, async (filePaths = []) => {
                            if (filePaths.length <= 0) return;
                            const [filename] = filePaths;

                            const isHTML = htmlExtensions.includes(path.extname(filename).slice(1));
                            const isMarkdown = markdownExtensions.includes(path.extname(filename).slice(1))

                            if (isHTML) {
                                win.webContents.send('app-state-change', { filename: filename, loading: true, loadingText: 'Loading html file...' });
                                const buffer = await fs.readFile(filename);
                                const markdown = turndown(buffer.toString());
                                win.webContents.send('app-state-change', { loading: false, markdown });
                            }
                            else if (isMarkdown) {
                                win.webContents.send('load-markdown-file', { filename });
                            }
                            else {
                                dialog.showErrorBox('File type unknown', `File "${filename}" was not of type html or markdown.`);
                            }
                        })
                    }
                },
                {
                    label: 'Exit',
                    click: () => app.quit()
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

