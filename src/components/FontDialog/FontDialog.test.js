
                import React from 'react';
import ReactDOM from 'react-dom';
import FontDialog from './FontDialog';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<FontDialog />, div);
  ReactDOM.unmountComponentAtNode(div);
});
