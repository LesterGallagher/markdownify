import React, { Component } from 'react';
import styles from './App.module.css';
import Markdown from '../Markdown/Markdown';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
     
    }
  }
  

  render = () => {
    return (
      <div className="App">
        <Markdown />
      </div>
    );
  }
}

export default App;
