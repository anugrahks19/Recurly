import React from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../public/Brand.jsx';

export function AuthShell({ title, eyebrow, description, alternate, children, wide = false }) {
  return <div className="public-app auth-page"><header className="auth-header"><Brand /><p>{alternate === 'signup' ? 'New to Recurly?' : 'Already have an account?'} <Link to={alternate === 'signup' ? '/signup' : '/login'}>{alternate === 'signup' ? 'Create an account' : 'Sign in'}</Link></p></header><main className="auth-main"><div className="auth-orbit orbit-one"/><div className="auth-orbit orbit-two"/><section className={`auth-card ${wide ? 'auth-card-wide' : ''}`}><div className="auth-title"><span className="auth-icon">✦</span><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{children}</section><p className="assurance"><span>Role based workspaces</span><span>•</span><span>Accounts verified by your organization</span></p></main></div>;
}

export function PasswordField({ value, onChange, autoComplete = 'current-password' }) {
  const [visible, setVisible] = React.useState(false);
  return <div className="input-wrap"><input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete={autoComplete} minLength={autoComplete === 'new-password' ? 12 : undefined} value={value} onChange={onChange} placeholder="Enter your password" required/><button className="password-toggle" type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</button></div>;
}

export function RoleSelector({ role, onChange }) {
  return <fieldset className="role-options"><legend>Choose your workspace</legend>{[['user', 'User'], ['staff', 'Staff'], ['admin', 'Admin']].map(([value, label]) => <label key={value}><input type="radio" name="role" value={value} checked={role === value} onChange={() => onChange(value)}/><span>{label}</span></label>)}</fieldset>;
}
