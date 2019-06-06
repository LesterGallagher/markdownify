const electron = require('electron');
const { app, BrowserWindow, Menu, dialog, ipcRenderer } = electron;
const path = require('path');
const turndown = require('./turndown');
const fs = require('fs-extra');



const markdownExtensions = exports.markdownExtensions = [
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

const htmlExtensions = exports.htmlExtensions = [
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

const txtExtensions = exports.txtExtensions = [
    'txt',
    'log',
    'text',
    'cnf',
    'conf',
    'cfg'
]

exports.openFile = async (win, filename) => {
    const isHTML = htmlExtensions.includes(path.extname(filename).slice(1));
    const isMarkdown = markdownExtensions.includes(path.extname(filename).slice(1))

    if (isHTML) {
        win.webContents.send('app-state-change', { filename: filename, loading: true, loadingText: 'Loading html file...' });
        const buffer = await fs.readFile(filename);
        const markdown = turndown(buffer.toString());
        win.webContents.send('app-state-change', { loading: false, markdown });
    }
    win.webContents.send('load-file-as-markdown', { filename });
}
