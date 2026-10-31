import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../AdminApp.jsx';
import DashboardInsights from '../components/DashboardInsights.jsx';
import { billingEvents, customerById, customers, invoices, money, payments, shortDate, subscriptions } from '../services/sampleData.js';

const TODAY = '2026-10-31';
const PAGE_SIZE = 5;
const isWithin = (date, days) => new Date(`${date}T00:00:00Z`) >= new Date(Date.parse(`${TODAY}T00:00:00Z`) - (days - 1) * 86400000);
const daysAhead = (date) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${TODAY}T00:00:00Z`)) / 86400000);

function installReferenceReveals(root = document) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();
  const elements = [...root.querySelectorAll('[data-reveal]')];
  const finish = (element) => { element.dataset.revealPlayed = 'true'; animations.get(element)?.cancel(); animations.delete(element); };
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      observer.unobserve(element);
      element.dataset.revealPlayed = 'true';
      if (reduced.matches || document.visibilityState === 'hidden' || entry.boundingClientRect.bottom <= 0) finish(element);
      else animations.get(element)?.play();
    }
  }, { threshold: 0, rootMargin: '0px 0px 96px 0px' }) : undefined;
  const stop = () => { observer?.disconnect(); elements.forEach(finish); };
  const onPreference = () => { if (reduced.matches) stop(); };
  reduced.addEventListener('change', onPreference);
  for (const element of elements) {
    if (element.dataset.revealPlayed === 'true') continue;
    const rect = element.getBoundingClientRect();
    if (reduced.matches || !observer || !element.animate || rect.top < innerHeight || document.visibilityState === 'hidden') { finish(element); continue; }
    const transform = element.dataset.reveal === 'slide' ? 'translateX(-12px)' : 'translateY(6px)';
    const animation = element.animate([{ opacity: 0, transform }, { opacity: 1, transform: 'none' }], { duration: Number(element.dataset.duration || 560), easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards', delay: Number(element.dataset.delay || 0) });
    animation.pause();
    animation.onfinish = () => finish(element);
    animations.set(element, animation);
    observer.observe(element);
  }
  return () => { stop(); reduced.removeEventListener('change', onPreference); };
}

const initials = (name) => name.split(' ').map((part) => part[0]).slice(0, 2).join('');
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
function exportCsv(rows) {
  const fields = ['id', 'customer', 'plan', 'status', 'renewal', 'amount'];
  const body = [fields.join(','), ...rows.map((item) => [item.id, customerById(item.customerId)?.name, item.plan, item.status, item.renewal, item.amount].map(csvCell).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'recurrly-sample-subscriptions.csv';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function MetricCard({ label, title, value, subline, icon, tone = 'mint', index }) {
  return <article className={`metric-card tone-${tone}`} data-reveal="rise" data-duration="480" data-delay={Math.min(index * 60, 180)}><div className="metric-card-top"><div><span className="metric-label">{label}</span><h3>{title}</h3></div><span className="metric-icon"><Icon name={icon} /></span></div><div className="metric-card-bottom"><strong>{value}</strong><span>{subline}</span></div></article>;
}

function Status({ value }) { return <span className={`status status-${value.toLowerCase().replaceAll(' ', '-')}`}><span />{value}</span>; }

export default function Dashboard({ navigate }) {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const [range, setRange] = useState(30);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [sort, setSort] = useState('renewal');
  const [page, setPage] = useState(1);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef(null);
  useEffect(() => {
    const cleanReveals = installReferenceReveals(rootRef.current);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let heroAnimations = [];
    if (!reduced.matches && heroRef.current && document.visibilityState === 'visible') {
      heroAnimations = [...heroRef.current.querySelectorAll('[data-hero]')].map((item, index) => item.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: index * 70, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' }));
    }
    const onPreference = () => { if (reduced.matches) heroAnimations.forEach((animation) => animation.finish()); };
    reduced.addEventListener('change', onPreference);
    return () => { cleanReveals(); heroAnimations.forEach((animation) => animation.cancel()); reduced.removeEventListener('change', onPreference); };
  }, []);
  useEffect(() => { setPage(1); }, [range, query, status, sort]);
  useEffect(() => {
    if (!record) return undefined;
    const previous = document.activeElement;
    dialogRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') setRecord(null);
      if (event.key !== 'Tab') return;
      const controls = [...dialogRef.current.querySelectorAll('button, a, input, select')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, [record]);
  const changeRange = (value) => { setLoading(true); setRange(Number(value)); window.setTimeout(() => setLoading(false), 180); };
  const periodCustomers = customers.filter((item) => isWithin(item.joined, range));
  const periodPayments = payments.filter((item) => isWithin(item.date, range));
  const currentActive = subscriptions.filter((item) => item.status === 'Active');
  const mrr = currentActive.reduce((sum, item) => sum + item.amount, 0);
  const revenue = periodPayments.filter((item) => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);
  const failed = periodPayments.filter((item) => item.status === 'Failed').length;
  const pending = invoices.filter((item) => item.status === 'Pending' && isWithin(item.date, range)).length;
  const churn = subscriptions.filter((item) => item.status === 'Cancelled' && isWithin(item.renewal, range)).length / subscriptions.length * 100;
  const renewals = subscriptions.filter((item) => item.status === 'Active' && daysAhead(item.renewal) >= 0 && daysAhead(item.renewal) <= 7).length;
  const metrics = [
    ['Recurring revenue', 'Monthly MRR', money(mrr), 'Current active monthly plans', 'payments', 'mint'],
    ['Subscriber base', 'Active subscriptions', currentActive.length.toLocaleString(), 'Current active records', 'group', 'ochre'],
    ['Customer base', 'Total customers', customers.length.toLocaleString(), `${periodCustomers.length} joined in ${range} days`, 'person_add', 'mint'],
    ['Retention health', 'Churn rate', `${churn.toFixed(1)}%`, `Cancelled in ${range} days`, 'autorenew', 'ochre'],
  ];
  const secondary = [
    ['ARR', money(mrr * 12), 'Annualized current MRR'],
    ['Total revenue', money(revenue), `Collected in ${range} days`],
    ['Failed payments', failed, `In ${range} days`],
    ['Pending invoices', pending, `Issued in ${range} days`],
    ['Upcoming renewals', renewals, 'Next 7 days'],
  ];
  const filtered = useMemo(() => subscriptions.filter((item) => {
    const customer = customerById(item.customerId);
    const matches = `${item.id} ${item.plan} ${customer?.name} ${customer?.email}`.toLowerCase().includes(query.toLowerCase());
    return matches && (status === 'All statuses' || item.status === status);
  }).sort((a, b) => sort === 'customer' ? customerById(a.customerId).name.localeCompare(customerById(b.customerId).name) : sort === 'amount' ? b.amount - a.amount : (a.renewal < TODAY) - (b.renewal < TODAY) || a.renewal.localeCompare(b.renewal)), [query, status, sort]);
  const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <main className="dashboard page-shell" ref={rootRef} aria-busy={loading}>
    <section className="dashboard-intro" id="dashboard_context" ref={heroRef}>
      <div className="intro-copy"><div className="intro-kicker" data-hero><span className="eyebrow-pill"><span className="kicker-dot" />ADMIN OVERVIEW</span><span className="sample-label">Sample data · {range}-day view</span></div><h1 data-hero>Subscription overview</h1><p data-hero>Review recurring revenue, account activity, and payments across the selected period.</p></div>
      <div className="intro-actions" data-hero><label className="select-control"><Icon name="calendar_month" /><span className="sr-only">Reporting period</span><select value={range} onChange={(event) => changeRange(event.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label><button className="primary-button" type="button" onClick={() => navigate('/admin/subscriptions')}>View subscriptions <Icon name="arrow_forward" /></button></div>
    </section>
    <section id="key_metrics" aria-label="Key metrics" className="metrics-section"><div className="metric-grid">{metrics.map(([label, title, value, subline, icon, tone], index) => <MetricCard key={title} label={label} title={title} value={value} subline={subline} icon={icon} tone={tone} index={index} />)}</div><div className="secondary-metrics" data-reveal="slide" data-duration="520">{secondary.map(([label, value, note]) => <div className="secondary-metric" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div></section>
    <div className="workspace-grid">
      <section id="subscription_ledger" className="ledger-panel" aria-labelledby="ledger-title" data-reveal="rise" data-duration="560"><div className="ledger-header"><div className="ledger-title-wrap"><span className="overlap-dots" aria-hidden="true"><i /><i /></span><h2 id="ledger-title">Subscription ledger</h2><span className="count-pill">{filtered.length} records</span></div><div className="ledger-tools"><label className="ledger-search"><Icon name="search" /><span className="sr-only">Search by customer or subscription ID</span><input type="search" placeholder="Search customer or ID..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><button type="button" className="icon-button export-button" title="Export filtered sample subscriptions as CSV" aria-label="Export filtered sample subscriptions as CSV" disabled={!filtered.length} onClick={() => exportCsv(filtered)}><Icon name="download" /></button></div></div>
        <div className="ledger-filter-bar"><label className="select-control slim"><span className="sr-only">Subscription status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>{['All statuses', 'Active', 'Trial', 'Past due', 'Paused', 'Cancelled', 'Expired'].map((value) => <option key={value}>{value}</option>)}</select></label><label className="select-control slim"><span className="sr-only">Sort subscriptions</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="renewal">Sort: renewal</option><option value="customer">Sort: customer</option><option value="amount">Sort: amount</option></select></label></div>
        <div className="table-wrap"><table><thead><tr><th scope="col">Customer</th><th scope="col">Plan</th><th scope="col">Status</th><th scope="col">Renewal</th><th scope="col">Amount</th><th scope="col">Action</th></tr></thead><tbody>{visible.map((item) => { const customer = customerById(item.customerId); return <tr key={item.id}><td><div className="person-cell"><span className="person-avatar">{initials(customer.name)}</span><span><strong>{customer.name}</strong><small>{item.id}</small></span></div></td><td><span className="plan-name">{item.plan}</span><small className="cell-sub">Monthly plan</small></td><td><Status value={item.status} /></td><td><span>{shortDate(item.renewal)}</span><small className="cell-sub">{daysAhead(item.renewal) > 0 ? `In ${daysAhead(item.renewal)} days` : daysAhead(item.renewal) === 0 ? 'Today' : 'Past date'}</small></td><td><strong>{money(item.amount)}</strong><small className="cell-sub">/mo</small></td><td><button type="button" className="row-action" onClick={() => setRecord(item)}>Open <Icon name="arrow_outward" /></button></td></tr>; })}</tbody></table>{!filtered.length && <div className="empty-state">No subscriptions match this search and status.</div>}</div>
        <div className="mobile-records">{visible.map((item) => { const customer = customerById(item.customerId); return <article className="mobile-record" key={item.id}><div className="mobile-record-top"><span className="person-avatar">{initials(customer.name)}</span><span><strong>{customer.name}</strong><small>{item.id} · {item.plan}</small></span><Status value={item.status} /></div><div className="mobile-record-meta"><span>Renewal <strong>{shortDate(item.renewal)}</strong></span><span>Amount <strong>{money(item.amount)}/mo</strong></span></div><button type="button" className="row-action" onClick={() => setRecord(item)}>Open record <Icon name="arrow_forward" /></button></article>; })}{!filtered.length && <div className="empty-state">No subscriptions match this search and status.</div>}</div>
        <div className="pagination"><span>Showing {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} sample records</span><div><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)}><Icon name="chevron_left" /></button>{Array.from({ length: maxPage }, (_, i) => <button key={i} type="button" className={page === i + 1 ? 'current' : ''} aria-label={`Page ${i + 1}`} aria-current={page === i + 1 ? 'page' : undefined} onClick={() => setPage(i + 1)}>{i + 1}</button>)}<button type="button" aria-label="Next page" disabled={page === maxPage} onClick={() => setPage(page + 1)}><Icon name="chevron_right" /></button></div></div>
      </section>
      <aside className="right-rail"><section id="upcoming_billing" className="billing-panel" aria-labelledby="billing-title"><div className="billing-head" data-reveal="slide" data-duration="500"><div className="billing-title"><span className="billing-icon"><Icon name="event_upcoming" /></span><h2 id="billing-title">Next 7 days</h2></div><span className="due-total">{money(billingEvents.reduce((sum, item) => sum + item.amount, 0))} due</span></div><p>Upcoming renewals and payment retries, ordered by date.</p><div className="billing-list">{billingEvents.map((event, index) => { const customer = customerById(event.customerId); return <button type="button" key={event.id} className="billing-item" data-reveal={index < 2 ? 'rise' : undefined} data-duration="500" data-delay={index * 70} onClick={() => navigate(event.state === 'Retry' ? '/admin/payments?status=failed' : `/admin/subscriptions?record=${subscriptions.find((item) => item.customerId === event.customerId)?.id}`)}><span className={`billing-avatar ${index % 2 ? 'ochre' : ''}`}>{initials(customer.name)}</span><span className="billing-person"><strong>{customer.name}</strong><small>{shortDate(event.date)} · {event.type}</small></span><span className="billing-amount"><strong>{money(event.amount)}</strong><small>{event.state}</small></span></button>; })}</div><div className="billing-links"><button type="button" onClick={() => navigate('/admin/billing')}>View billing <Icon name="arrow_forward" /></button><button type="button" onClick={() => navigate('/admin/payments?status=failed')}>Failed payments <Icon name="arrow_forward" /></button></div></section></aside>
    </div>
    <DashboardInsights range={range} navigate={navigate} />
    {record && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRecord(null); }}><section className="record-dialog" role="dialog" aria-modal="true" aria-labelledby="record-dialog-title" ref={dialogRef} tabIndex={-1}><div className="dialog-top"><span className="eyebrow">SUBSCRIPTION RECORD</span><button type="button" className="icon-button" aria-label="Close record" onClick={() => setRecord(null)}><Icon name="close" /></button></div><h2 id="record-dialog-title">{customerById(record.customerId)?.name}</h2><p>{record.id} · {record.plan} plan</p><dl><div><dt>Status</dt><dd><Status value={record.status} /></dd></div><div><dt>Renewal</dt><dd>{shortDate(record.renewal)}</dd></div><div><dt>Monthly amount</dt><dd>{money(record.amount)}</dd></div><div><dt>Customer email</dt><dd>{customerById(record.customerId)?.email}</dd></div></dl><button type="button" className="primary-button" onClick={() => { setRecord(null); navigate(`/admin/subscriptions?record=${record.id}`); }}>View subscription <Icon name="arrow_forward" /></button></section></div>}
  </main>;
}
