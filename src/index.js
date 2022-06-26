import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/antd.css'; //引入antd的所有样式

import App from './App';
// import 'antd/dist/antd.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
