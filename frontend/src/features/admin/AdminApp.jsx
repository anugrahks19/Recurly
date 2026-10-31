import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const base = import.meta.env.VITE_API_BASE_URL || '';
const sections = ['dashboard','staff','customers','plans','products','subscriptions','quotations','invoices','payments','coupons','queries','requests','auditLogs'];
const title = key => ({ auditLogs: 'Audit logs' }[key] || key[0].toUpperCase() + key.slice(1));
async function api(path, options) {
  const response = await fetch(`${base}/api/admin${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
const fields = {
  staff: [['name','Full name'],['email','Email address'],['password','Temporary password'],['specialId','Special ID']],
  plans: [['name','Plan name'],['description','Description'],['daily','Daily price (optional)'],['weekly','Weekly price (optional)'],['monthly','Monthly price'],['annual','Annual price'],['trialDays','Trial days'],['features','Features, comma separated']],
  products: [['name','Product name'],['type','Type'],['price','Sales price'],['cost','Cost'],['notes','Notes']],
  subscriptions: [['customerId','Customer ID'],['planId','Plan ID'],['interval','Interval (daily, weekly, monthly, annual)'],['discountCode','Discount code (optional)']],
  coupons: [['code','Code'],['kind','Kind (percent or fixed)'],['value','Value'],['minimum','Minimum purchase'],['minimumQuantity','Minimum quantity'],['scope','Scope (subscription or product)'],['endsAt','End date (optional)'],['usageLimit','Usage limit (optional)']],
  payments: [['invoiceId','Invoice ID'],['amount','Amount'],['method','Method or reference'],['externalReference','External reference'],['note','Note']],
};
const numeric = new Set(['daily','weekly','monthly','annual','trialDays','price','cost','value','minimum','minimumQuantity','usageLimit','amount']);

export default function AdminApp() {
  const location = useLocation(); const navigate = useNavigate(); const { logout } = useAuth();
  const section = location.pathname.split('/')[2] || 'dashboard';
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [form, setForm] = useState({}); const [busy, setBusy] = useState(false);
  const refresh = async () => { try { setData(await api('/workspace')); setError(''); } catch (e) { setError(e.message); } };
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (location.pathname === '/admin') navigate('/admin/dashboard', { replace: true }); }, [location.pathname, navigate]);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const body = Object.fromEntries(Object.entries(form).filter(([,v]) => v !== '').map(([k,v]) => [k, numeric.has(k) ? Number(v) : k === 'features' ? v.split(',').map(x => x.trim()).filter(Boolean) : v]));
      await api(`/${section}`, { method: 'POST', body: JSON.stringify(body) }); setForm({}); await refresh();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function invoiceAction(invoiceId, action) { try { await api(`/invoices/${invoiceId}/${action}`, { method: 'POST' }); await refresh(); } catch(e) { setError(e.message); } }
  async function runBilling() { try { const result=await api('/billing/run',{method:'POST'}); await refresh(); setError(`${result.created} invoice(s) generated.`); } catch(e) { setError(e.message); } }
  async function signOut() { try { await logout(); navigate('/login', { replace: true }); } catch(e) { setError(e.message); } }
  const rows = section === 'dashboard' ? [] : data?.[section] || [];
  const keys = rows.length ? Object.keys(rows[0]).filter(k => !['details_json','password_hash','special_id_hash'].includes(k)).slice(0, 7) : [];
  return <div className="admin-app live-admin">
    <header className="live-admin-head"><NavLink to="/admin/dashboard" className="live-admin-brand">Recurly<span>.</span></NavLink><span>Admin workspace</span><button onClick={signOut}>Sign out</button></header>
    <div className="live-admin-shell"><nav aria-label="Admin sections" className="live-admin-nav">{sections.map(key => <NavLink key={key} to={`/admin/${key}`} className={section === key ? 'active' : ''}>{title(key)}</NavLink>)}</nav>
      <main className="live-admin-main"><div className="live-admin-title"><div><span className="eyebrow">ADMIN WORKSPACE</span><h1>{title(section)}</h1></div><button onClick={refresh}>Refresh</button></div>
        {error && <p className="live-admin-error" role="alert">{error}</p>}
        {section === 'invoices' && <button onClick={runBilling}>Generate due invoices</button>}
        {section === 'dashboard' && data && <><div className="live-admin-stats">{Object.entries(data.summary).map(([key,value]) => <article key={key}><span>{title(key)}</span><strong>{key === 'revenue' ? `$${value.toFixed(2)}` : value}</strong></article>)}</div><h2>Recent activity</h2><p>Review invoices, payments, staff requests, and audit logs using the navigation.</p></>}
        {fields[section] && <section className="live-admin-panel"><h2>Create {section === 'staff' ? 'staff account' : title(section).toLowerCase().slice(0,-1)}</h2><form onSubmit={submit} className="live-admin-form">{fields[section].map(([key,label]) => <label key={key}>{label}<input type={key === 'email' ? 'email' : key === 'password' || key === 'specialId' ? 'password' : numeric.has(key) ? 'number' : 'text'} min={numeric.has(key) ? 0 : undefined} step={numeric.has(key) && !['trialDays','minimumQuantity','usageLimit'].includes(key) ? '0.01' : undefined} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} required={['name','email','password','specialId','monthly','annual','price','code','kind','value','invoiceId','amount','method'].includes(key)} /></label>)}<button disabled={busy}>{busy ? 'Saving…' : 'Create'}</button></form></section>}
        {section !== 'dashboard' && <section className="live-admin-panel"><div className="live-admin-list-head"><h2>{title(section)} records</h2><span>{rows.length} shown</span></div>{rows.length ? <div className="live-admin-table-wrap"><table><thead><tr>{keys.map(k => <th key={k}>{title(k)}</th>)}{section === 'invoices' && <th>Actions</th>}</tr></thead><tbody>{rows.map(row => <tr key={row.id}>{keys.map(k => <td key={k}>{typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k] ?? '')}</td>)}{section === 'invoices' && <td>{row.status === 'Draft' && <button onClick={() => invoiceAction(row.id,'confirm')}>Confirm</button>}{['Draft','Confirmed'].includes(row.status) && <button onClick={() => invoiceAction(row.id,'cancel')}>Cancel</button>}</td>}</tr>)}</tbody></table></div> : <p>No records yet.</p>}</section>}
      </main></div>
  </div>;
}
