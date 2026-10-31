import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, Icon, PageHeader, StatusBadge } from '../../../shared/components/Ui.jsx';
import { dateLabel, ErrorView, LoadingView, money } from '../components/CustomerUi.jsx';
import { useCustomer } from '../hooks/useCustomer.jsx';

const filters = ['All', 'Active', 'Trial', 'Paused', 'Cancelled', 'Expired'];
export function Subscriptions() {
  const { data, loading, error, refresh } = useCustomer(); const [filter, setFilter] = useState('All');
  if (loading) return <LoadingView />; if (error || !data) return <ErrorView message={error || 'Subscriptions unavailable.'} retry={refresh} />;
  const rows = data.subscriptions.filter(s=>filter==='All'||s.status===filter);
  return <div className="page-wrap"><PageHeader eyebrow="Customer view · membership" title="My Subscriptions" description="View current and previous plans, billing dates, and membership history." action={<Link className="button button-ochre" to="/customer/plans"><Icon name="add"/> Explore Plans</Link>} />
    <div className="filter-chips" role="group" aria-label="Filter subscriptions">{filters.map(item=><button key={item} className={filter===item?'active':''} onClick={()=>setFilter(item)}>{item}</button>)}</div>
    {rows.length?<div className="subscription-grid">{rows.map(s=>{const plan=data.plans.find(p=>p.id===s.planId);return <article className="panel subscription-card" key={s.id}><div className="subscription-card-top"><div><span className="eyebrow">{s.interval} membership</span><h2>{plan?.name||s.planId}</h2></div><StatusBadge status={s.status}/></div><p>{plan?.description}</p><div className="subscription-card-facts"><div><small>Started</small><strong>{dateLabel(s.startedAt)}</strong></div><div><small>{s.nextBillingAt?'Next billing':'Ended'}</small><strong>{dateLabel(s.nextBillingAt||s.endedAt)}</strong></div><div><small>Amount</small><strong>{money(s.amount)}/{s.interval==='annual'?'yr':'mo'}</strong></div></div><Link className="button button-outline" to={`/customer/subscriptions/${s.id}`}>View Details <Icon name="arrow_forward" /></Link></article>})}</div>:<section className="panel"><EmptyState icon="subscriptions" title="No subscriptions here" text="Try another status or explore available plans." /></section>}
  </div>;
}
