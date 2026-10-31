import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Brand } from '../public/Brand.jsx';

export function RoleHome({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  async function signOut() {
    try { await logout(); navigate('/login', { replace: true }); }
    catch (err) { setError(err.message); }
  }
  return <div className="public-app role-home"><header className="site-header"><Brand /><button className="button button-light button-small" onClick={signOut}>Sign out</button></header><main className="section"><span className="kicker">{role} workspace</span><h1>Welcome, {user.name || user.email}.</h1><p>Your account is signed in with {role} access.</p><div className="feature-grid"><article className="feature"><span className="feature-index">Workspace</span><h3>{role === 'admin' ? 'Admin access' : 'Your subscriptions'}</h3><p>{role === 'admin' ? 'Admin features are ready to connect to your backend.' : 'Your subscription data will appear here when the account API is connected.'}</p></article></div>{error && <p role="alert">{error}</p>}</main></div>;
}
