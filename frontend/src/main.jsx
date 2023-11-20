import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Upload from './Upload.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Upload />
    <App />
  </React.StrictMode>,
)
