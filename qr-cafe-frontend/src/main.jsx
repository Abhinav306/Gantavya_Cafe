import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('PWA Service Worker registered with scope: ', registration.scope);
      },
      (err) => {
        console.log('PWA Service Worker registration failed: ', err);
      }
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
