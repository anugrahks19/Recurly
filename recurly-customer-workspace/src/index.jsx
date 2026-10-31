import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CustomerProvider } from './features/customer/hooks/useCustomer.jsx';
import { CustomerRoutes } from './features/customer/routes/CustomerRoutes.jsx';
import './shared/styles/tokens.css';
import './shared/styles/global.css';
import './shared/styles/customer.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><CustomerProvider><CustomerRoutes /></CustomerProvider></BrowserRouter></React.StrictMode>);
