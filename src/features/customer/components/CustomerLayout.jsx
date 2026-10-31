import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '../../../shared/components/Ui.jsx';
import { useCustomer } from '../hooks/useCustomer.jsx';

const links = [
  { to: '/customer/dashboard', label: 'Home' }, { to: '/customer/plans', label: 'Plans' },
  { to: '/customer/subscriptions', label: 'Subscriptions' }, { to: '/customer/billing', label: 'Billing' },
  { to: '/customer/payments', label: 'Payments' }, { to: '/customer/notifications', label: 'Notifications' },
  { to: '/customer/profile', label: 'Profile' }, { to: '/customer/support', label: 'Support' },
];
export function CustomerLayout() {
  const [open, setOpen] = useState(false); const { data, isDemo } = useCustomer();
  const unread = data?.notifications?.filter(n => !n.read).length || 0;
  return <div className="app-shell"><a className="skip-link" href="#customer-content">Skip to content</a><header className="site-header"><div className="header-inner">
    <NavLink to="/customer/dashboard" className="brand" onClick={() => setOpen(false)} aria-label="Recurly customer home"><span className="brand-mark"><i /><i /></span><span>Recurly</span></NavLink>
    <nav id="customer-navigation" className={`main-nav customer-nav ${open ? 'open' : ''}`} aria-label="Customer navigation">{links.map(item => <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>{item.label}{item.label === 'Notifications' && unread > 0 && <span className="nav-count">{unread}</span>}</NavLink>)}</nav>
    <div className="header-side"><span className="customer-role">Customer portal</span><span className="profile-divider" /><span className="avatar">{data?.profile?.name?.trim().split(/\s+/).map(part => part[0]).join('').slice(0,2) || 'CU'}</span><span className="profile-text"><strong>{data?.profile?.name || 'Customer'}</strong><small>My Account</small></span></div>
    <button type="button" className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} aria-controls="customer-navigation"><Icon name={open ? 'close' : 'menu'} /></button>
  </div></header>{isDemo && <div className="demo-banner" role="status"><Icon name="info" /> Demo preview: account data is illustrative. Purchases and billing changes are unavailable in this preview.</div>}<main id="customer-content" tabIndex={-1} className="main-content"><Outlet /></main><footer className="site-footer"><div><strong>Recurly</strong><span>Subscription Management</span></div><small>Customer Portal</small></footer></div>;
}
