import React from 'react';
import { customerById, customers, money, payments, shortDate, subscriptions } from '../services/sampleData.js';

const TODAY = Date.parse('2026-10-31T00:00:00Z');
const DAY = 86400000;
const ageOf = (date) => Math.floor((TODAY - Date.parse(`${date}T00:00:00Z`)) / DAY);
const within = (date, range) => ageOf(date) >= 0 && ageOf(date) < range;

function buckets(items, range, dateKey, amount) {
  const values = Array.from({ length: 6 }, () => 0);
  items.forEach((item) => {
    if (within(item[dateKey], range)) values[5 - Math.min(5, Math.floor(ageOf(item[dateKey]) * 6 / range))] += amount(item);
  });
  return values.map((value, index) => ({
    value,
    label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(TODAY - Math.floor((5 - index) * range / 6) * DAY)),
  }));
}

function Trend({ title, values, format, color }) {
  const max = Math.max(1, ...values.map(({ value }) => value));
  const total = values.reduce((sum, item) => sum + item.value, 0);
  return <div className="trend-view"><div className="trend-heading"><h3>{title}</h3><strong>{format(total)}</strong></div><div className="trend-bars" role="img" aria-label={`${title}: ${values.map(({ label, value }) => `${label} ${format(value)}`).join(', ')}`}>
    {values.map(({ label, value }, index) => <div className="trend-column" key={index} aria-hidden="true"><div className="trend-track"><span className={`trend-bar ${color}`} style={{ height: value ? `${Math.max(8, value / max * 100)}%` : '0%' }} /></div><small>{label}</small></div>)}
  </div></div>;
}

function ActivityList({ title, rows, empty, render, onOpen }) {
  return <div className="activity-group"><h3>{title}</h3>{rows.length ? <div className="activity-list">{rows.map((row) => <button type="button" className="activity-row" key={row.id} onClick={() => onOpen(row)}>{render(row)}</button>)}</div> : <p className="insight-empty">{empty}</p>}</div>;
}

export default function DashboardInsights({ range, navigate }) {
  const periodPayments = payments.filter((item) => within(item.date, range));
  const revenue = buckets(payments.filter((item) => item.status === 'Paid'), range, 'date', (item) => item.amount);
  const growth = buckets(subscriptions, range, 'started', () => 1);
  const planCounts = ['Starter', 'Core', 'Growth', 'Scale'].map((name) => ({ name, count: subscriptions.filter((item) => item.plan === name).length }));
  const recentPayments = periodPayments.slice(0, 4);
  const recentCustomers = customers.filter((item) => within(item.joined, range)).slice(0, 4);
  const failed = periodPayments.filter((item) => item.status === 'Failed').slice(0, 3);

  return <section className="dashboard-insights" aria-label="Dashboard charts and activity">
    <div className="insight-primary-grid">
      <section className="insight-panel" aria-labelledby="trends-title" data-reveal="rise" data-duration="560"><div className="insight-head"><h2 id="trends-title">Revenue and subscriptions</h2><span>Last {range} days</span></div><div className="trend-grid"><Trend title="Revenue trend" values={revenue} format={money} color="mint" /><Trend title="Subscription growth" values={growth} format={(value) => String(value)} color="ochre" /></div></section>
      <section className="insight-panel" aria-labelledby="plans-title" data-reveal="slide" data-duration="560"><div className="insight-head"><h2 id="plans-title">Plan distribution</h2><span>{subscriptions.length} sample records</span></div><div className="plan-distribution">{planCounts.map(({ name, count }) => <div className="plan-distribution-row" key={name}><div><strong>{name}</strong><span>{count}</span></div><div className="plan-track"><span style={{ width: `${count / subscriptions.length * 100}%` }} /></div></div>)}</div></section>
    </div>
    <div className="insight-activity-grid" data-reveal="rise" data-duration="600">
      <section className="insight-panel" aria-labelledby="activity-title"><div className="insight-head"><h2 id="activity-title">Recent activity</h2><span>Last {range} days</span></div><div className="activity-columns"><ActivityList title="Transactions" rows={recentPayments} empty="No transactions in this period." onOpen={(row) => navigate(`/admin/payments?record=${row.id}`)} render={(row) => <><span><strong>{customerById(row.customerId)?.name}</strong><small>{row.id} · {shortDate(row.date)}</small></span><span className="activity-end"><strong>{money(row.amount)}</strong><small>{row.status}</small></span></>} /><ActivityList title="Customer registrations" rows={recentCustomers} empty="No registrations in this period." onOpen={(row) => navigate(`/admin/customers?record=${row.id}`)} render={(row) => <><span><strong>{row.name}</strong><small>{row.id}</small></span><span className="activity-end"><small>{shortDate(row.joined)}</small></span></>} /></div></section>
      <section className="insight-panel" aria-labelledby="failed-title"><div className="insight-head"><h2 id="failed-title">Failed payments</h2><span>{failed.length} in period</span></div><div className="activity-list">{failed.length ? failed.map((row) => <button type="button" className="activity-row" key={row.id} onClick={() => navigate(`/admin/payments?record=${row.id}`)}><span><strong>{customerById(row.customerId)?.name}</strong><small>{row.id} · {shortDate(row.date)}</small></span><span className="activity-end"><strong>{money(row.amount)}</strong><small>Failed</small></span></button>) : <p className="insight-empty">No failed payments in this period.</p>}</div><button type="button" className="insight-link" onClick={() => navigate('/admin/payments?status=failed')}>View failed payments <span aria-hidden="true">→</span></button></section>
    </div>
  </section>;
}
