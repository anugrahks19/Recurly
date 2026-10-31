import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authRequest } from './api.js';
import { AuthShell, PasswordField, RoleSelector } from './AuthShell.jsx';

export function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError(''); setBusy(true);
    try {
      await authRequest('register', { method: 'POST', body: JSON.stringify({ name: name.trim(), email: email.trim(), password }) });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <AuthShell title="Create your account." eyebrow="Join Recurly" description="Choose your access type to see how to get started." alternate="login" wide><RoleSelector role={role} onChange={value => { setRole(value); setError(''); }}/>{role === 'user' ? <form className="auth-form" onSubmit={submit}><p className="role-help">Public signup creates a user account. Your role is assigned by the server.</p><div className="form-grid"><div><label htmlFor="name">Full name</label><div className="input-wrap"><input id="name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your name" required/></div></div><div><label htmlFor="email">Email address</label><div className="input-wrap"><input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required/></div></div></div><label htmlFor="password">Password</label><PasswordField value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password"/><p className="role-help">Use at least 12 characters.</p><label htmlFor="confirm-password">Confirm password</label><div className="input-wrap"><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} value={confirm} onChange={event => setConfirm(event.target.value)} required/></div><button className="button button-dark button-full" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create user account'} <span>→</span></button>{error && <p className="form-message error" role="alert">{error}</p>}</form> : <div className="restricted-signup"><h2>{role === 'admin' ? 'Admin' : 'Staff'} access is issued by your organization.</h2><p>Ask your organization for an account and special ID. Once you have both, choose {role} on the sign in page.</p><Link className="button button-dark button-full" to="/login">Go to sign in →</Link></div>}</AuthShell>;
}
