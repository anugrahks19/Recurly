import React from 'react';
import { Link } from 'react-router-dom';
import { DataTable, EmptyState, Icon, StatusBadge } from '../../../shared/components/Ui.jsx';
import { dateLabel, ErrorView, LoadingView, money, Notice } from '../components/CustomerUi.jsx';
import { useCustomer } from '../hooks/useCustomer.jsx';

export function Dashboard() {
  const { data, loading, error, refresh } = useCustomer();
  if (loading) return <LoadingView />;
  if (error || !data) return <ErrorView message={error || 'Account unavailable.'} retry={refresh} />;
  const current = data.subscriptions.find(s => ['Active', 'Trial'].includes(s.status));
  const plan = data.plans.find(p => p.id === current?.planId);
  const method = data.paymentMethods.find(m => m.isDefault);
  const payments = [...data.payments].sort((a,b) => b.date.localeCompare(a.date));
  const invoices = [...data.invoices].sort((a,b) => b.date.localeCompare(a.date));
  const unread = data.notifications.filter(n => !n.read);
  const initials = data.profile.name.trim().split(/\s+/).map(p => p[0]).join('').slice(0,2);
  return <div className="page-wrap membership-dashboard">
    <section className="panel member-banner" aria-label="Account overview">
      <div className="member-portrait" aria-hidden="true">{initials}<span /></div>
      <div className="member-identity"><div className="member-name"><h1>{data.profile.name}</h1>{current && <StatusBadge status={current.status} />}{plan && <span className="member-tier">{plan.name} member</span>}</div><p>{current ? 'Member since ' + dateLabel(current.startedAt) : 'Your membership starts here'}</p><div className="member-meta"><span><Icon name="mail" />{data.profile.email}</span>{data.profile.company && <span><Icon name="business" />{data.profile.company}</span>}</div></div>
      <Link className="button button-primary" to="/customer/profile"><Icon name="tune" /> Account settings</Link>
    </section>
    <div className="membership-top-grid">
      <section className="panel membership-plan">
        {current ? <><div className="membership-plan-heading"><div><span className="eyebrow">Your current membership</span><h2>{plan?.name || current.planId}</h2><p>{plan?.description || 'Your subscription at a glance.'}</p></div><div className="membership-price"><strong>{money(current.amount)}</strong><span> / {current.interval === 'annual' ? 'year' : 'month'}</span><small>{current.status === 'Trial' ? 'Trial membership' : 'Recurring membership'}</small></div></div>
          <div className="billing-period"><div><strong>Next billing</strong><span>{dateLabel(current.nextBillingAt)}</span></div><div className="billing-period-rule" /><div><small>{current.interval === 'annual' ? 'Annual billing' : 'Monthly billing'}</small><Link to="/customer/billing">View billing details <Icon name="arrow_forward" /></Link></div></div>
          <h3 className="membership-section-label">Included in your membership</h3><div className="membership-benefits">{plan?.features?.map((feature,i) => <div key={feature}><Icon name={['workspaces','group','monitoring','support_agent'][i % 4]} /><span>{feature}</span></div>)}</div>
          {current.status === 'Trial' && <Notice>Your trial ends {dateLabel(current.trialEndsAt)}. Review billing before it expires.</Notice>}
          <div className="membership-actions"><Link className="button button-primary" to="/customer/plans">Explore plans <Icon name="arrow_forward" /></Link><Link className="button button-outline" to={'/customer/subscriptions/' + current.id}>Manage subscription</Link></div>
        </> : <><EmptyState icon="subscriptions" title="No active subscription" text="Explore plans to choose your membership." /><Link className="button button-primary" to="/customer/plans">Browse plans</Link></>}
      </section>
      <aside className="panel membership-payment"><div className="membership-card-title"><h2>Payment Method</h2>{method && <span className="subtle-pill">Default</span>}</div><p>Your saved method for recurring billing.</p>{method ? <div className="payment-preview" aria-label={method.brand + ' ending ' + method.last4 + ', expires ' + method.expiry}><div className="payment-preview-brand">Recurly<Icon name="contactless" /></div><small>Card identifier</small><strong className="masked-card">•••• •••• •••• {method.last4}</strong><div className="payment-preview-bottom"><div><small>Payment network</small><strong>{method.brand}</strong></div><div><small>Expires</small><strong>{method.expiry}</strong></div></div></div> : <EmptyState icon="credit_card" title="No default method" text="Add a method for future billing." />}
        <div className="last-transaction"><span>Last payment</span><strong>{payments[0] ? money(payments[0].amount) : 'No payments yet'}</strong></div>{payments[0] && <small className="payment-date">{dateLabel(payments[0].date)}</small>}<Link className="button button-soft" to="/customer/payment-methods"><Icon name="credit_card" /> Update billing details</Link>
      </aside>
    </div>
    <div className="membership-detail-grid"><section className="panel side-panel"><div className="side-title"><Icon name="notifications" /><h2>Account Updates</h2><span className="subtle-pill">{unread.length} unread</span></div>{data.notifications.length ? <div className="membership-updates">{data.notifications.slice(0,3).map(n => <Link key={n.id} to="/customer/notifications"><span className={'update-indicator ' + (n.read ? 'read' : '')} /><div><strong>{n.title}</strong><p>{n.detail}</p><small>{dateLabel(n.date)}</small></div><Icon name="arrow_forward" /></Link>)}</div> : <EmptyState icon="notifications_none" title="All caught up" text="Account updates will appear here." />}<Link className="text-link" to="/customer/notifications">All notifications <Icon name="arrow_forward" /></Link></section>
      <section className="panel side-panel"><div className="side-title"><Icon name="history" /><h2>Membership Activity</h2></div>{current?.history?.length ? <div className="membership-activity">{[...current.history].sort((a,b) => b.date.localeCompare(a.date)).map((item,i) => <div key={i}><span className="icon-box"><Icon name={/payment/i.test(item.title) ? 'payments' : 'verified'} /></span><div><strong>{item.title}</strong><small>{dateLabel(item.date)}</small></div><StatusBadge status="Recorded" /></div>)}</div> : <EmptyState icon="history" title="No activity yet" text="Membership changes will appear here." />}<div className="membership-help"><Icon name="support_agent" /><div><strong>A little help, whenever you need it.</strong><p>Questions about your plan or a charge?</p></div><Link className="text-link" to="/customer/support">Get support <Icon name="arrow_forward" /></Link></div></section></div>
    <section className="panel membership-ledger"><div className="panel-heading"><div><h2>Invoices & Billing Ledger</h2><p>Your charges, upcoming invoices, and payment status.</p></div><Link className="button button-soft" to="/customer/invoices"><Icon name="receipt_long" /> View all invoices</Link></div><DataTable data={invoices.slice(0,5)} columns={[{key:'id',label:'Invoice ID'},{key:'date',label:'Date',render:r=>dateLabel(r.date)},{key:'description',label:'Plan / Description'},{key:'dueDate',label:'Due date',render:r=>dateLabel(r.dueDate)},{key:'amount',label:'Amount',render:r=>money(r.amount)},{key:'status',label:'Status',render:r=><StatusBadge status={r.status}/>}]} emptyMessage="Your invoices will appear here." /><div className="ledger-footer"><span>Showing {Math.min(invoices.length,5)} of {invoices.length} invoices</span><Link className="text-link" to="/customer/payments">Payment history <Icon name="arrow_forward" /></Link></div></section>
  </div>;
}

