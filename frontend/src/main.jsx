import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App.jsx';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import { StaffDataProvider } from './features/staff/components/StaffDataProvider.jsx';
import './shared/styles/tokens.css';
import './shared/styles/global.css';
import './features/public/public.css';
import './features/public/extras.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider><StaffDataProvider><App /></StaffDataProvider></AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
