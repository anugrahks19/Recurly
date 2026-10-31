import React from 'react';
import { Link } from 'react-router-dom';
import { DataTable, Icon, PageHeader, StatusBadge } from '../../../shared/components/Ui.jsx';
import { dateLabel, ErrorView, LoadingView, money, Notice } from '../components/CustomerUi.jsx';
import { useCustomer } from '../hooks/useCustomer.jsx';

export function Payments() {
  const {data,loading,error,refresh}=useCustomer();if(loading)return <LoadingView/>;if(error||!data)return <ErrorView message={error||'Payments unavailable.'} retry={refresh}/>;
  const failed=data.payments.filter(p=>p.status==='Failed');
  return <div className="page-wrap"><PageHeader eyebrow="Customer view · transactions" title="Payment History" description="Track successful and failed payments and keep your payment method current." action={<Link className="button button-outline" to="/customer/payment-methods"><Icon name="credit_card"/> Payment Methods</Link>}/>
    {failed.length>0&&<Notice kind="error">A payment failed. Review the reason below, update your payment method, and follow the recovery instructions from your provider.</Notice>}
    <section className="panel"><div className="panel-heading"><div><span className="section-mark"><i/><i/></span><h2>Transactions</h2><span className="subtle-pill">{data.payments.length} Records</span></div></div><DataTable data={data.payments} columns={[{key:'id',label:'Reference'},{key:'date',label:'Date',render:r=>dateLabel(r.date)},{key:'method',label:'Method'},{key:'amount',label:'Amount',render:r=>money(r.amount)},{key:'status',label:'Status',render:r=><StatusBadge status={r.status}/>},{key:'reason',label:'Details',render:r=>r.failureReason||'—'}]} emptyMessage="No payments yet."/></section>
    <section className="panel side-panel history-panel"><span className="eyebrow">Payment recovery</span><h2>If a payment fails</h2><p>Check your card expiration and available funds, then update your saved method. If an invoice remains unpaid, contact support with its reference. The backend will determine when a retry is available.</p><Link className="button button-outline" to="/customer/support">Get Support</Link></section>
  </div>;
}
