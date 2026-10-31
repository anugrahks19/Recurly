import React, { useEffect, useMemo, useRef, useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import { auditLogs, coupons, customerById, customers, invoices, payments, plans, reports, settings, staff, subscriptions, money, shortDate } from './services/sampleData.js';

export const adminLinks = [
  ['Dashboard', '/admin/dashboard'], ['Staff', '/admin/staff'], ['Customers', '/admin/customers'],
  ['Subscriptions', '/admin/subscriptions'], ['Plans', '/admin/plans'], ['Billing', '/admin/billing'],
  ['Invoices', '/admin/invoices'], ['Payments', '/admin/payments'], ['Coupons', '/admin/coupons'],
  ['Reports', '/admin/reports'], ['Settings', '/admin/settings'], ['Audit logs', '/admin/audit-logs'],
];

export function Icon({ name, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden="true">{name}</span>;
}

function usePath() {
  const currentPath = () => window.location.protocol === 'file:' || window.location.pathname === '/' ? '/admin/dashboard' : window.location.pathname + window.location.search;
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = (next) => {
    if (next === path) return;
    window.history.pushState({}, '', next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  return [path, navigate];
}

function useOutside(ref, onClose) {
  useEffect(() => {
    const close = (event) => { if (ref.current && !ref.current.contains(event.target)) onClose(); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [ref, onClose]);
}

function Header({ path, navigate }) {
  const [menu, setMenu] = useState('');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef(null);
  useOutside(headerRef, () => { setMenu(''); setSearchOpen(false); });
  const page = adminLinks.find(([, target]) => target === path.split('?')[0])?.[0] || 'Dashboard';
  const matches = query.trim() ? [...customers.map((item) => ({ label: item.name, meta: item.id, path: `/admin/customers?record=${item.id}` })), ...subscriptions.map((item) => ({ label: item.id, meta: `${customerById(item.customerId)?.name} · ${item.plan}`, path: `/admin/subscriptions?record=${item.id}` }))].filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [];
  const go = (target) => { navigate(target); setMenu(''); setSearchOpen(false); setQuery(''); };
  return <header className="site-header" ref={headerRef}>
    <div className="header-inner">
      <a href="/admin/dashboard" className="wordmark" onClick={(event) => { event.preventDefault(); go('/admin/dashboard'); }}>Recurrly<span className="wordmark-dot">.</span></a>
      <span className="compact-page-label">{page}</span>
      <nav className="main-nav" aria-label="Admin navigation">
        {adminLinks.slice(0, 5).map(([label, target]) => <a key={target} href={target} aria-current={path.split('?')[0] === target ? 'page' : undefined} onClick={(event) => { event.preventDefault(); go(target); }}>{label}</a>)}
        <div className="menu-anchor"><button type="button" className={`nav-more ${menu === 'more' ? 'selected' : ''}`} aria-expanded={menu === 'more'} onClick={() => setMenu(menu === 'more' ? '' : 'more')}>More <Icon name="expand_more" /></button>{menu === 'more' && <div className="dropdown nav-dropdown">{adminLinks.slice(5).map(([label, target]) => <button type="button" key={target} onClick={() => go(target)}>{label}</button>)}</div>}</div>
      </nav>
      <div className="header-spacer" />
      <span className="role-pill">Admin</span>
      <div className="header-search-wrap">
        <label className="header-search"><Icon name="search" /><span className="sr-only">Search Admin records</span><input type="search" placeholder="Search records..." value={query} onFocus={() => setSearchOpen(true)} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} /></label>
        {searchOpen && query && <div className="dropdown search-results" role="listbox" aria-label="Search results">{matches.length ? matches.map((item) => <button type="button" key={item.path} onClick={() => go(item.path)}><strong>{item.label}</strong><small>{item.meta}</small></button>) : <div className="dropdown-empty">No matching sample records</div>}</div>}
      </div>
      <button type="button" className="icon-button compact-search" aria-label="Search records" onClick={() => setMenu(menu === 'search' ? '' : 'search')}><Icon name="search" /></button>
      <div className="menu-anchor"><button type="button" className="icon-button notification-button" aria-label="Notifications" aria-expanded={menu === 'notifications'} onClick={() => setMenu(menu === 'notifications' ? '' : 'notifications')}><Icon name="notifications" /><span className="notification-dot" /></button>{menu === 'notifications' && <div className="dropdown alerts-dropdown"><strong>Notifications</strong><button type="button" onClick={() => go('/admin/payments?status=failed')}>Payment retry for Jordan Ellis <small>Nov 3 · {money(39)}</small></button><button type="button" onClick={() => go('/admin/invoices?status=pending')}>2 pending sample invoices <small>Review invoices</small></button></div>}</div>
      <div className="menu-anchor account-anchor"><button type="button" className="account-button" aria-label="Admin account" aria-expanded={menu === 'account'} onClick={() => setMenu(menu === 'account' ? '' : 'account')}><span className="avatar-small">AD</span><span className="account-copy"><strong>Admin</strong><small>Workspace view</small></span><Icon name="expand_more" /></button>{menu === 'account' && <div className="dropdown account-dropdown"><span>Admin workspace</span><small>Sample data view</small><button type="button" onClick={() => go('/admin/settings')}>Settings</button></div>}</div>
      <button type="button" className="icon-button mobile-menu-button" aria-label="Open Admin menu" aria-expanded={menu === 'mobile'} onClick={() => setMenu(menu === 'mobile' ? '' : 'mobile')}><Icon name={menu === 'mobile' ? 'close' : 'menu'} /></button>
    </div>
    {menu === 'search' && <div className="compact-search-panel"><label className="header-search"><Icon name="search" /><span className="sr-only">Search Admin records</span><input autoFocus type="search" placeholder="Search records..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>{query && <div className="compact-results">{matches.length ? matches.map((item) => <button type="button" key={item.path} onClick={() => go(item.path)}>{item.label} <small>{item.meta}</small></button>) : <span>No matching sample records</span>}</div>}</div>}
    {menu === 'mobile' && <nav className="mobile-nav" aria-label="Admin destinations"><span className="mobile-current">{page}</span>{adminLinks.map(([label, target]) => <button type="button" className={path.split('?')[0] === target ? 'active' : ''} key={target} onClick={() => go(target)}>{label}<Icon name="arrow_forward" /></button>)}</nav>}
  </header>;
}

function ModulePage({ path, navigate }) {
  const [pathname, search] = path.split('?');
  const title = adminLinks.find(([, target]) => target === pathname)?.[0] || 'Admin';
  const params = new URLSearchParams(search || '');
  const recordId = params.get('record');
  const status = params.get('status');
  const sources = { '/admin/staff': staff, '/admin/customers': customers, '/admin/subscriptions': subscriptions, '/admin/plans': plans, '/admin/billing': invoices, '/admin/invoices': invoices, '/admin/payments': payments, '/admin/coupons': coupons, '/admin/reports': reports, '/admin/settings': settings, '/admin/audit-logs': auditLogs };
  const source = sources[pathname] || [];
  const rows = source.filter((item) => !status || item.status?.toLowerCase() === status.toLowerCase());
  const selected = source.find((item) => item.id === recordId);
  return <main className="module-page page-shell"><div className="module-intro"><span className="eyebrow">ADMIN WORKSPACE · SAMPLE DATA</span><h1>{title}</h1><p>Review {title.toLowerCase()} records in the sample dataset.</p><button type="button" className="text-link" onClick={() => navigate('/admin/dashboard')}><Icon name="arrow_back" /> Back to dashboard</button></div><section className="module-panel"><div className="module-panel-top"><h2>{title} records</h2><span>{rows.length} shown</span></div><div className="module-list">{rows.map((item) => <button type="button" key={item.id} className={recordId === item.id ? 'selected' : ''} onClick={() => navigate(`${pathname}?record=${item.id}`)}><span><strong>{item.name || customerById(item.customerId)?.name || item.id}</strong><small>{item.id}{item.plan ? ` · ${item.plan}` : ''}</small></span><span>{item.status || shortDate(item.joined)}{item.amount ? ` · ${money(item.amount)}` : ''}</span><Icon name="arrow_forward" /></button>)}</div></section>{selected && <section className="module-detail" aria-label="Selected record"><div><span className="eyebrow">RECORD DETAIL</span><h2>{selected.name || customerById(selected.customerId)?.name || selected.id}</h2><p>{selected.id} {selected.plan ? `· ${selected.plan}` : ''}</p></div><dl>{Object.entries(selected).filter(([key]) => key !== 'customerId').map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{key === 'amount' ? money(value) : value}</dd></div>)}</dl></section>}</main>;
}

export default function AdminApp() {
  const [path, navigate] = usePath();
  useEffect(() => { if (window.location.pathname === '/') navigate('/admin/dashboard'); }, []);
  return <><Header path={path} navigate={navigate} />{path.split('?')[0] === '/admin/dashboard' || path === '/' ? <Dashboard navigate={navigate} /> : <ModulePage path={path} navigate={navigate} />}</>;
}
