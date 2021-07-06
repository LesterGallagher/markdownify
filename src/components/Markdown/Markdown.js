import React, { Component } from 'react';
import styles from './Markdown.module.css';
import Editor from 'rich-markdown-editor';

const ipcRenderer = require('electron').ipcRenderer

const INITIAL_OPTIONS = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 56, 72]
    .map(fontsize => ({ key: '' + fontsize, text: '' + fontsize }));

let markdownGetter

ipcRenderer.on('save', () => {
    const markdown = markdownGetter()
    ipcRenderer.send('save-file', { markdown })
})

const AnyLink = props => {
    console.log(props)
    return null
}

class Markdown extends Component {

    shouldComponentUpdate = (nextProps) => {
        return nextProps.children !== this.props.children;
    }

    uploadImage = (file, ...args) => {
        console.log('uploadImage()', file, args)
        return new Promise((resolve, reject) => {
            console.log('uploaded image return promise')
            ipcRenderer.on('uploaded-image', (event, args) => {
                if (file.path === args.filename) {
                    console.log('uploaded image', args)
                    resolve(args.url)
                }
            })
            ipcRenderer.send('upload-image', { filename: file.path })
        })
    }

    onChange = (value) => {
        markdownGetter = value
    }

    render = () => {
        return (
            <div className={styles.container}>
                <Editor
                    onClickLink={this.onClickLink}
                    uploadImage={this.uploadImage}
                    className="markdown-body"
                    onChange={this.onChange}
                    value={this.props.children} />
            </div>
        );
    }
}

export default Markdown;
