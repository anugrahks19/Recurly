import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Icon, PageHeader } from '../../../shared/components/Ui.jsx';
import { ErrorView, LoadingView, money, PlanCard } from '../components/CustomerUi.jsx';
import { useCustomer } from '../hooks/useCustomer.jsx';

export function PlanDetails() {
  const { planId } = useParams(); const [params] = useSearchParams(); const interval = ['daily','weekly','monthly','annual'].includes(params.get('interval'))?params.get('interval'):'monthly';
  const { data, loading, error, refresh } = useCustomer();
  if (loading) return <LoadingView />; if (error || !data) return <ErrorView message={error || 'Plan unavailable.'} retry={refresh} />;
  const plan = data.plans.find(p=>p.id===planId); if (!plan || plan[interval]==null) return <ErrorView message="Plan or billing interval not available." />;
  return <div className="page-wrap"><Link className="back-link" to="/customer/plans"><Icon name="arrow_back" /> All plans</Link><PageHeader eyebrow="Customer view · plan details" title={plan.name} description={plan.description} />
    <div className="detail-layout"><PlanCard plan={plan} interval={interval} action={<Link className="button button-ochre plan-action" to={`/customer/checkout/${plan.id}?interval=${interval}`}>Continue to Checkout <Icon name="arrow_forward" /></Link>} /><section className="panel side-panel"><span className="eyebrow">What you get</span><h2>Thoughtful flexibility</h2><p>Review your plan and final price before any subscription is created.</p><div className="detail-points"><div><Icon name="calendar_month"/><span>{interval[0].toUpperCase()+interval.slice(1)} billing at {money(plan[interval])}</span></div><div><Icon name="redeem"/><span>{plan.trialDays?`${plan.trialDays}-day trial available`:'No trial on this plan'}</span></div><div><Icon name="verified_user"/><span>Changes require your confirmation</span></div></div></section></div>
  </div>;
}
