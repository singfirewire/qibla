import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// สร้าง root element สำหรับ React app
const root = ReactDOM.createRoot(document.getElementById('root'));

// เรนเดอร์แอพ
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);