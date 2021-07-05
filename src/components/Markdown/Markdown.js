import React, { Component } from 'react';
import styles from './Markdown.module.css';
import Editor from 'rich-markdown-editor';
import path from 'path'
import { URL } from 'url'

const INITIAL_OPTIONS = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 56, 72]
    .map(fontsize => ({ key: '' + fontsize, text: '' + fontsize }));

class Markdown extends Component {

    transformLinkUri = uri => {
        if (/^https?:\/\//.test(uri) || !this.props.filename || !uri) {
            return uri;
        } else {
            const filepath = path.resolve(path.dirname(this.props.filename), uri);
            return URL.pathToFileURL(filepath);
        }

    }

    transformImageUri = uri => {
        if (/^https?:\/\//.test(uri) || !this.props.filename || !uri) {
            return uri;
        } else {
            const filepath = path.resolve(path.dirname(this.props.filename), uri);
            return URL.pathToFileURL(filepath);
        }

    }

    shouldComponentUpdate = (nextProps) => {
        return nextProps.children !== this.props.children;
    }

    render = () => {
        return (
            <div className={styles.container}>
                <Editor 
                    className="markdown-body" 
                    transformImageUri={this.transformImageUri} 
                    transformLinkUri={this.transformLinkUri}
                    value={this.props.children} />
            </div>
        );
    }
}

export default Markdown;
