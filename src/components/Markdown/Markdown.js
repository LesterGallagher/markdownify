import React, { Component } from 'react';
import styles from './Markdown.module.css';
import ReactMarkdown from 'react-markdown';
import IndexedDBStorage from '../../lib/indexeddb-wrapper';

var { ipcRenderer, remote } = window.require('electron');
var customTitlebar = window.require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#0078d4'),
});

const db = new IndexedDBStorage('storage');

const fs = remote.require('fs-extra');
const path = remote.require('path');
const URL = remote.require('url');

class Markdown extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            loadingText: 'Loading...',
            markdown: '',
            filename: null
        }
    }
    componentDidMount = async () => {
        ipcRenderer.on('load-markdown-file', async (event, { filename }) => {
            this.setState({ loading: true, filename, loadingText: 'loading file...' })
            const buffer = await fs.readFile(filename);
            const markdown = buffer.toString();
            this.setState({ loading: false, markdown });
            if (markdown) {
                setTimeout(() => {
                    db.set('state', { markdown, filename });
                }, 180);
            }
        });
        ipcRenderer.on('app-state-change', this.handleIpcStateChange);
        const state = await db.get('state') || { filename: '## Hello World' };
        console.log(state);
        this.setState(state);

    }

    componentWillUnmount() {
        ipcRenderer.removeListener('app-state-change', this.handleIpcStateChange);
    }

    handleIpcStateChange = (event, args) => {
        console.log(args);
        this.setState(args);
        const { markdown, filename } = args;
        if (markdown && filename) {
            setTimeout(() => {
                db.set('state', { markdown, filename });
            }, 180);
        }
    }

    transformLinkUri = uri => {
        if (/^https?:\/\//.test(uri)) {
            return uri;
        } else {
            const filepath = path.resolve(path.dirname(this.state.filename), uri);
            return URL.pathToFileURL(filepath);
        }

    }

    transformImageUri = uri => {
        if (/^https?:\/\//.test(uri)) {
            return uri;
        } else {
            const filepath = path.resolve(path.dirname(this.state.filename), uri);
            return URL.pathToFileURL(filepath);
        }

    }

    render = () => {
        const { markdown, loading, loadingText } = this.state;
        return (
            <div className={styles.container}>
                <ReactMarkdown className="markdown-body" transformImageUri={this.transformImageUri} transformLinkUri={this.transformLinkUri}>{markdown}</ReactMarkdown>
            </div>
        );
    }
}

export default Markdown;
