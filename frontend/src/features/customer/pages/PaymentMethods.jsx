import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, PageHeader } from '../../../shared/components/Ui.jsx';
import { Notice } from '../components/CustomerUi.jsx';

export function PaymentMethods() {
  return <div className="page-wrap">
    <Link className="back-link" to="/customer/payments"><Icon name="arrow_back"/> Payment history</Link>
    <PageHeader eyebrow="Customer view · secure billing" title="Payment Methods" description="Choose UPI, card, netbanking, or another available method during Razorpay Secure Checkout." />
    <section className="panel form-panel"><h2>Managed by Razorpay</h2><p>Recurly does not receive or store your card details. Available payment options appear when you start a purchase in Razorpay Secure Checkout.</p><Notice>Saved payment options depend on your Razorpay account and checkout settings. There is no payment method stored in this portal.</Notice><Link className="button button-primary" to="/customer/plans">Browse plans</Link></section>
  </div>;
}
