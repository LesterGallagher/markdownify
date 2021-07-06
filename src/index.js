import React from 'react';
import ReactDOM from 'react-dom';
import 'github-markdown-css/github-markdown.css'
import './index.css';
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

var customTitlebar = window.require('custom-electron-titlebar');

new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#0078d4'),
    icon: './logo.svg',
});

initializeIcons();

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
