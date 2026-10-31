import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/Ui.jsx';
import { dateLabel, ErrorView, LoadingView, PlanCard } from '../components/CustomerUi.jsx';
import { useCustomer } from '../hooks/useCustomer.jsx';

export function Plans() {
  const { data, loading, error, refresh } = useCustomer(); const [interval, setInterval] = useState('monthly');
  if (loading) return <LoadingView />; if (error || !data) return <ErrorView message={error || 'Plans unavailable.'} retry={refresh} />;
  return <div className="page-wrap"><PageHeader eyebrow="Customer view · membership" title="Plans & Pricing" description="Find the right fit. Compare what is included before choosing a subscription." />
    <div className="billing-toggle" role="group" aria-label="Billing interval">{['daily','weekly','monthly','annual'].filter(cycle=>data.plans.some(plan=>plan[cycle]!=null)).map(cycle=><button key={cycle} className={interval===cycle?'active':''} onClick={()=>setInterval(cycle)}>{cycle[0].toUpperCase()+cycle.slice(1)}</button>)}</div>
    <div className="plan-grid">{data.plans.filter(plan=>plan[interval]!=null).map(plan=><PlanCard key={plan.id} plan={plan} interval={interval} featured={plan.id==='atelier'} action={<Link className={`button ${plan.id==='atelier'?'button-ochre':'button-primary'} plan-action`} to={`/customer/plans/${plan.id}?interval=${interval}`}>Explore {plan.name}</Link>} />)}</div>
    <section className="panel comparison-panel"><h2>Compare Features</h2><div className="table-scroll"><table><thead><tr><th>Feature</th>{data.plans.map(p=><th key={p.id}>{p.name}</th>)}</tr></thead><tbody>{['Workspaces','Team seats','Reporting','Support','Free trial'].map((label,i)=><tr key={label}><td><strong>{label}</strong></td>{data.plans.map(p=><td key={p.id}>{i===4?(p.trialDays?`${p.trialDays} days`:'Not available'):p.features[i]||'—'}</td>)}</tr>)}</tbody></table></div></section>
    {data.coupons?.length>0&&<section className="panel side-panel history-panel"><span className="eyebrow">Available offers</span><h2>Discounts</h2><p>Eligibility is checked during checkout. These offers may have plan or account restrictions.</p><div className="offer-list">{data.coupons.map(c=><div key={c.code}><strong>{c.code}</strong><span>{c.kind==='percent'?`${c.value}% off`:`₹${c.value} off`} · Expires {dateLabel(c.expiresAt)}</span></div>)}</div></section>}
  </div>;
}
