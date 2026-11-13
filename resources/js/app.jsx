import React from 'react';
import ReactDOM from 'react-dom/client';
import '../css/app.css';
import '../../ositara-frontend/src/index.css';
import App from '../../ositara-frontend/src/App';

const rootElement = document.getElementById('app');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
