import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Try different possible paths for App import
let App;
try {
  App = require('./App').default;
} catch (e) {
  console.warn("Could not load App from ./App, trying alternative paths...");
  try {
    App = require('../App').default;
  } catch (e2) {
    console.error("Failed to import App component. Please check file structure.");
    // Fallback to a simple component if App can't be found
    App = () => <div>Error loading app. Please check console.</div>;
  }
}

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(); 