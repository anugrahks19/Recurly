import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StaffRoutes } from './features/staff/routes/StaffRoutes.jsx';
import { StaffDataProvider } from './features/staff/components/StaffDataProvider.jsx';
import './shared/styles/tokens.css';
import './shared/styles/global.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StaffDataProvider><StaffRoutes /></StaffDataProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
