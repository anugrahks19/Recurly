import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './features/admin/AdminApp.jsx';
import './shared/styles/theme.css';

createRoot(document.getElementById('root')).render(<AdminApp />);
