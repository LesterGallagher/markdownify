import React, { Component } from 'react';
import styles from './Markdown.module.css';
import ReactMarkdown from 'react-markdown';

var { remote } = window.require('electron');

const path = remote.require('path');
const URL = remote.require('url');

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
        console.log(this.props.children)
        return (
            <div className={styles.container}>
                <ReactMarkdown className="markdown-body" transformImageUri={this.transformImageUri} transformLinkUri={this.transformLinkUri}>{this.props.children}</ReactMarkdown>
            </div>
        );
    }
}

export default Markdown;
