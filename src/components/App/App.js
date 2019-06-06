import React, { Component } from 'react';
import styles from './App.module.css';
import Markdown from '../Markdown/Markdown';
import IndexedDBStorage from '../../lib/indexeddb-wrapper';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ComboBox } from 'office-ui-fabric-react/lib/ComboBox';
import { Fabric } from 'office-ui-fabric-react/lib/index'


var { ipcRenderer, remote } = window.require('electron');


const fs = remote.require('fs-extra');
const path = remote.require('path');
const URL = remote.require('url');

const INITIAL_OPTIONS = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 56, 72]
  .map(fontsize => ({ key: '' + fontsize, text: '' + fontsize }));


const db = new IndexedDBStorage('storage');

class App extends Component {
  _basicComboBox = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      loadingText: 'Loading...',
      markdown: '',
      filename: null,
      hideFontDialog: true,
      fontsize: localStorage.getItem('fontsize') || 14,
      hideOnlyOneFileDialog: true
    }

  }
  componentDidMount = async () => {
    ipcRenderer.on('load-file-as-markdown', async (event, { filename }) => {
      this.setState({ loading: true, filename, markdown: '', loadingText: 'loading file...' })
      const buffer = await fs.readFile(filename);
      const markdown = buffer.toString();
      this.setState({ loading: false, markdown, filename });
      if (markdown) {
        setTimeout(() => {
          db.set('state', { markdown, filename });
        }, 180);
      }
    });
    ipcRenderer.on('app-state-change', this.handleIpcStateChange);
    ipcRenderer.send('get-opened-file-data');
    const state = await db.get('state');
    this.setState(state && state.markdown ? state : { markdown: '## Hello World' });
    console.log(this.ref);

  }

  componentWillUnmount() {
    ipcRenderer.removeListener('app-state-change', this.handleIpcStateChange);
  }

  handleIpcStateChange = (event, args) => {
    console.log(args);
    this.setState(args);
    const { markdown } = args;
    if (markdown) {
      setTimeout(() => {
        db.set('state', { markdown, filename: this.state.filename });
      }, 180);
    }
  }

  handleDragOver = e => {
    e.preventDefault();
    console.log('drag over');
  }

  handleDrop = e => {
    console.log(e);

    console.log('drop');

    if (e.dataTransfer.files.length > 1) {
      this.setState({ hideOnlyOneFileDialog: false });
      return;
    }

    const file = e.dataTransfer.files[0];
    const filename = file.path;

    ipcRenderer.send('open-file', { filename });

    console.log(file);
  }

  render = () => {
    const { filename, markdown, fontsize } = this.state;

    return (
      <div className="App" onDrop={this.handleDrop} onDragOver={this.handleDragOver}>
        <style>
          .markdown-body {'{'}
          font-size: {fontsize}px
          {'}'}
        </style>
        <Markdown filename={filename}>{this.state.markdown}</Markdown>

        <Dialog
          hidden={this.state.hideOnlyOneFileDialog}
          onDismiss={() => this.setState({ hideOnlyOneFileDialog: true })}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Multiple files',
            subText: 'You dragged multiple files into the app. You can only drag 1 file into the app at a time.'
          }}>
          <DialogFooter>
            <PrimaryButton onClick={() => this.setState({ hideOnlyOneFileDialog: true })} text="Close" />
          </DialogFooter>
        </Dialog>

        <Dialog
          hidden={this.state.hideFontDialog}
          onDismiss={() => this.setState({ hideFontDialog: true })}
          dialogContentProps={{
            type: DialogType.normal,
            title: 'Font',
          }}
          modalProps={{
            styles: { main: { maxWidth: 450 } }
          }}
        >
          <DialogFooter>
            <ComboBox
              defaultSelectedKey="C"
              label="Single-select ComboBox (uncontrolled, allowFreeform: T, autoComplete: T)"
              allowFreeform
              autoComplete="on"
              options={INITIAL_OPTIONS}
              componentRef={this._basicComboBox}
              onFocus={() => console.log('onFocus called for basic uncontrolled example')}
              onBlur={() => console.log('onBlur called for basic uncontrolled example')}
              onMenuOpen={() => console.log('ComboBox menu opened')}
              onPendingValueChanged={(option, pendingIndex, pendingValue) =>
                console.log(`Preview value was changed. Pending index: ${pendingIndex}. Pending value: ${pendingValue}.`)
              }
            />

            <br />
            <PrimaryButton onClick={this.setFontSize} text="Save" />
            <DefaultButton onClick={e => this.setState({ hideFontDialog: true })} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </div>
    );
  }

  setFontSize = () => {
    localStorage.setItem('fontsize', +this._basicComboBox.current._currentVisibleValue);
    this.setState({
      fontsize: +this._basicComboBox.current._currentVisibleValue,
      hideFontDialog: true
    });
  }
}

export default App;
