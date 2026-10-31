import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, homeForRole } from './AuthContext.jsx';
import { AuthShell, PasswordField, RoleSelector } from './AuthShell.jsx';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialId, setSpecialId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await login({ email: email.trim(), password, role, ...(role !== 'user' ? { specialId: specialId.trim() } : {}) });
      const requested = location.state?.from;
      navigate(requested === homeForRole[user.role] || requested?.startsWith(`${homeForRole[user.role]}/`) ? requested : homeForRole[user.role], { replace: true });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <AuthShell title="Welcome back." eyebrow="Your workspace" description="Select your access and sign in to continue." alternate="signup"><form className="auth-form" onSubmit={submit}><RoleSelector role={role} onChange={value => { setRole(value); setError(''); }}/>{location.state?.registered && <p className="form-message" role="status">Account created. Sign in to continue.</p>}<label htmlFor="email">Email address</label><div className="input-wrap"><input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required/></div><label htmlFor="password">Password</label><PasswordField value={password} onChange={event => setPassword(event.target.value)}/>{role !== 'user' && <><label htmlFor="special-id">{role === 'admin' ? 'Admin' : 'Staff'} special ID</label><div className="input-wrap"><input id="special-id" type="text" autoComplete="off" value={specialId} onChange={event => setSpecialId(event.target.value)} placeholder="ID provided by your organization" required/></div><p className="role-help">Your organization provides this ID. It is verified by the server along with your account.</p></>}<button className="button button-dark button-full" type="submit" disabled={busy}>{busy ? 'Signing in…' : `Sign in as ${role}`} <span>→</span></button>{error && <p className="form-message error" role="alert">{error}</p>}<p className="auth-small"><Link to="/forgot-password">Forgot password?</Link> · Need a user account? <Link to="/signup">Sign up</Link></p></form></AuthShell>;
}
