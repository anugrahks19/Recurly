import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icon } from '../../../shared/components/Ui.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useStaffData } from './StaffDataProvider.jsx';

const links = [
  { to: '/staff/dashboard', label: 'Home' },
  { to: '/staff/customers', label: 'Manage Customer' },
  { to: '/staff/discounts-queries', label: 'Discounts & Query' },
  { to: '/staff/quotations', label: 'New Quotation' },
  { to: '/staff/reach-admin', label: 'Reach Admin' },
];

export function StaffLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const { error: dataError } = useStaffData();
  const navigate = useNavigate();
  async function signOut() {
    try { await logout(); navigate('/login', { replace: true }); }
    catch (err) { setError(err.message); }
  }
  return <div className="app-shell">
    <header className="site-header"><div className="header-inner">
      <NavLink to="/staff/dashboard" className="brand" onClick={() => setMenuOpen(false)} aria-label="Recurly staff home"><span className="brand-mark"><i /><i /></span><span>Recurly</span></NavLink>
      <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Staff navigation">{links.map(link => <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>{link.label}</NavLink>)}</nav>
      <div className="header-side"><span className="role-switch"><strong>Staff</strong></span><span className="profile-divider" /><span className="avatar">{(user.name || user.email || 'S').slice(0, 2).toUpperCase()}</span><span className="profile-text"><strong>{user.name || user.email}</strong><small>Operations</small></span><button className="button button-outline" type="button" onClick={signOut}>Sign out</button></div>
      <button type="button" className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
    </div></header>
    <main className="main-content">{(error || dataError) && <p className="form-error" role="alert">{error || dataError}</p>}<Outlet /></main>
    <footer className="site-footer"><div><strong>Recurly</strong><span>Subscription Operations</span></div><small>Staff workspace</small></footer>
  </div>;
}
