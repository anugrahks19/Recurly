import React from 'react';
import { Link } from 'react-router-dom';
import { DataTable, Icon, PageHeader, StatCard, StatusBadge } from '../../../shared/components/Ui.jsx';
import { useStaffData } from '../components/StaffDataProvider.jsx';

export function StaffHome() {
  const { customers, queries, quotations } = useStaffData();
  const active = customers.filter(item => item.status === 'Active').length;
  const open = queries.filter(item => item.status !== 'Resolved').length;
  const drafts = quotations.filter(item => item.status === 'Draft').length;
  const attention = customers.filter(item => item.status === 'Past Due');
  return <div className="page-wrap">
    <PageHeader eyebrow="Staff view · operations" title="Your workspace" description="A clear view of customer activity, open requests, and quotations awaiting your attention." action={<Link className="button button-ochre" to="/staff/quotations"><Icon name="add" /> New Quotation</Link>} />
    <section className="stat-grid" aria-label="Staff overview">
      <StatCard eyebrow="Assigned portfolio" title="Customers" value={customers.length} trend={`${active} active accounts`} icon="group" />
      <StatCard eyebrow="Support queue" title="Open Queries" value={open} trend="Review customer questions" icon="support_agent" />
      <StatCard eyebrow="Sales desk" title="Draft Quotations" value={drafts} trend="Ready for review" icon="request_quote" />
      <StatCard eyebrow="Billing watch" title="Needs Attention" value={attention.length} trend="Past due accounts" icon="priority_high" />
    </section>
    <div className="content-grid"><section className="panel ledger-panel"><div className="panel-heading"><div><span className="section-mark"><i /><i /></span><h2>Customer Ledger</h2><span className="subtle-pill">{customers.length} Assigned</span></div><Link className="text-link" to="/staff/customers">View all <Icon name="arrow_forward" /></Link></div>
      <DataTable columns={[
        { key: 'name', label: 'Customer', render: row => <div className="person-cell"><span className="initials">{row.name.split(' ').map(p => p[0]).join('').slice(0, 2)}</span><div><strong>{row.name}</strong><small>{row.email}</small></div></div> },
        { key: 'plan', label: 'Plan' },
        { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
        { key: 'renewal', label: 'Renewal', render: row => new Date(`${row.renewal}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
      ]} data={customers.slice(0, 5)} />
    </section><aside className="side-stack"><section className="panel side-panel"><div className="side-title"><span className="icon-box ochre"><Icon name="assignment" /></span><h2>Today’s Focus</h2></div><p>Keep customer conversations and proposals moving.</p><div className="focus-list"><Link to="/staff/discounts-queries"><span><strong>{open} open queries</strong><small>Review and update status</small></span><Icon name="arrow_forward" /></Link><Link to="/staff/customers"><span><strong>{attention.length} past due accounts</strong><small>Check customer details</small></span><Icon name="arrow_forward" /></Link><Link to="/staff/reach-admin"><span><strong>Need a decision?</strong><small>Send a note to Admin</small></span><Icon name="arrow_forward" /></Link></div></section><section className="panel access-panel"><span className="eyebrow">Access scope</span><h3>Staff Operations</h3><p>Customer records, query handling, quotations, and admin requests are available in this workspace. Server permissions will be enforced during integration.</p></section></aside></div>
  </div>;
}
