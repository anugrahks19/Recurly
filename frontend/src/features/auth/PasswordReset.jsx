import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authRequest } from './api.js';
import { AuthShell, PasswordField } from './AuthShell.jsx';

export function PasswordReset() {
  const [params] = useSearchParams(); const token = params.get('token');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) { e.preventDefault(); if(token && password !== confirm) { setError('Passwords do not match.'); return; } setBusy(true); setError(''); try { const result=await authRequest(token ? 'reset-password' : 'forgot-password',{method:'POST',body:JSON.stringify(token?{token,password}:{email})}); setMessage(result.message); } catch(err) { setError(err.message); } finally { setBusy(false); } }
  return <AuthShell title={token?'Set a new password':'Reset your password'} eyebrow="Account security" description={token?'Use at least 12 characters, uppercase, lowercase, and a special character.':'Enter your registered email address to receive a reset link.'} alternate="login"><form className="auth-form" onSubmit={submit}>{token ? <><label>New password</label><PasswordField value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/><label htmlFor="confirm-password">Confirm password</label><div className="input-wrap"><input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={12}/></div></> : <><label htmlFor="reset-email">Email address</label><div className="input-wrap"><input id="reset-email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div></>}<button className="button button-dark button-full" disabled={busy}>{busy?'Please wait…':token?'Change password':'Send reset link'}</button>{message&&<p className="form-message" role="status">{message}</p>}{error&&<p className="form-message error" role="alert">{error}</p>}<p className="auth-small"><Link to="/login">Back to sign in</Link></p></form></AuthShell>;
}
