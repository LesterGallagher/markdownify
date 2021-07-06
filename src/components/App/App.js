import React, { Component } from 'react';
import styles from './App.module.css';
import Markdown from '../Markdown/Markdown';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ComboBox } from 'office-ui-fabric-react/lib/ComboBox';
import mimeTypes from 'mime-types'

const ipcRenderer = require('electron').ipcRenderer

const INITIAL_OPTIONS = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 56, 72]
  .map(fontsize => ({ key: '' + fontsize, text: '' + fontsize }));


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
    ipcRenderer.on('load-file-as-markdown', async (event, { filename, markdown }) => {
      this.setState({ loading: false, markdown, filename });
      if (markdown) {
        setTimeout(() => {
          localStorage.setItem('filename', filename)
        }, 180);
      }
    });
    ipcRenderer.on('app-state-change', this.handleIpcStateChange);
    ipcRenderer.send('get-opened-file-data');
    const filename = await window.localStorage.getItem('filename');
    if (filename) {
      ipcRenderer.send('open-file', { filename })
    } else {
      ipcRenderer.send('load-default-file');
    }

  }

  componentWillUnmount() {
    ipcRenderer.removeListener('app-state-change', this.handleIpcStateChange);
  }

  handleIpcStateChange = (event, args) => {
    this.setState(args);
    const { filename } = args;
    console.log({ filename })
    if (filename) {
      setTimeout(() => {
        localStorage.setItem('filename', filename);
      }, 180);
    }
  }

  handleDragOver = e => {
    e.preventDefault();
  }

  handleDrop = e => {
    if (e.dataTransfer.files.length > 1) {
      this.setState({ hideOnlyOneFileDialog: false });
      return;
    }

    const file = e.dataTransfer.files[0];
    const filename = file.path;

    const mime = mimeTypes.lookup(filename)
    console.log('mime', mime)

    if (mime.startsWith('video/')
      || mime.startsWith('audio/')
      || mime.startsWith('application/')
      || mime.startsWith('image/')
      || mime.startsWith('font/')) {
      return
    }

    ipcRenderer.send('open-file', { filename });
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
