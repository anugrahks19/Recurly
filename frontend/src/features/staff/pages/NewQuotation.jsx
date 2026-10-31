import React, { useMemo, useState } from 'react';
import { DataTable, Icon, PageHeader, StatusBadge } from '../../../shared/components/Ui.jsx';
import { useStaffData } from '../components/StaffDataProvider.jsx';

export function NewQuotation() {
  const { customers, plans, discounts, quotations, update } = useStaffData();
  const prices = Object.fromEntries(plans.map(plan => [plan.name, plan.monthly]));
  const [form, setForm] = useState({ customerId: '', plan: '', seats: 1, discountCode: '', note: '' });
  const [notice, setNotice] = useState('');
  const discount = useMemo(() => discounts.find(item => item.code.toLowerCase() === form.discountCode.trim().toLowerCase() && item.status === 'Active' && item.expires >= new Date().toISOString().slice(0, 10)), [discounts, form.discountCode]);
  const subtotal = (prices[form.plan] || 0) * Number(form.seats || 0);
  const savings = discount ? discount.type === 'Percentage' ? subtotal * discount.value / 100 : discount.value : 0;
  const total = Math.max(0, subtotal - savings);
  async function save(event) {
    event.preventDefault();
    if (form.discountCode.trim() && !discount) { setNotice('Enter an active discount code or leave the field blank.'); return; }
    try { await update('quotations', { ...form, seats: Number(form.seats), discountCode: discount?.code ?? '' }); setForm({ customerId: '', plan: '', seats: 1, discountCode: '', note: '' }); setNotice('Draft quotation saved.'); }
    catch (err) { setNotice(err.message); }
  }
  return <div className="page-wrap"><PageHeader eyebrow="Staff view · sales desk" title="New Quotation" description="Prepare a clear monthly proposal for an assigned customer. Save drafts for review before sending." />
    <div className="quote-layout"><section className="panel form-panel"><div className="panel-heading"><div><span className="section-mark"><i /><i /></span><h2>Quotation Details</h2></div></div><form onSubmit={save}><div className="form-grid"><label className="full-span">Customer<select required value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}><option value="">Select a customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}</select></label><label>Plan<select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}><option value="">Select a plan</option>{plans.map(plan => <option key={plan.id} value={plan.name}>{plan.name}</option>)}</select></label><label>Seats<input type="number" min="1" max="1000" required value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} /></label><label className="full-span">Discount code <span className="optional">optional</span><input value={form.discountCode} onChange={e => { setForm({ ...form, discountCode: e.target.value }); setNotice(''); }} placeholder="e.g. WELCOME10" /></label><label className="full-span">Internal note <span className="optional">optional</span><textarea rows="4" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Scope, terms, or context for review" /></label></div>{notice && <p className={notice.startsWith('Enter') ? 'form-error' : 'form-success'} role="status">{notice}</p>}<div className="form-actions"><button type="submit" className="button button-primary"><Icon name="save" /> Save Draft</button></div></form></section><aside className="panel quote-summary"><span className="eyebrow">Live estimate</span><h2>Proposal Summary</h2><p>Monthly recurring estimate based on the selected plan and seats.</p><div className="summary-line"><span>{form.plan} × {form.seats || 0}</span><strong>${subtotal.toFixed(2)}</strong></div><div className="summary-line"><span>Discount {discount ? `(${discount.code})` : ''}</span><strong>−${savings.toFixed(2)}</strong></div><div className="summary-total"><span>Estimated monthly total</span><strong>${total.toFixed(2)}</strong></div><small>Taxes and final billing terms will be determined by the backend.</small></aside></div>
    <section className="panel history-panel"><div className="panel-heading"><div><span className="section-mark"><i /><i /></span><h2>Saved Quotations</h2><span className="subtle-pill">{quotations.length} Drafts</span></div></div><DataTable data={quotations} columns={[{ key: 'id', label: 'Reference' }, { key: 'customerId', label: 'Customer', render: row => customers.find(c => c.id === row.customerId)?.name ?? 'Unknown customer' }, { key: 'plan', label: 'Plan' }, { key: 'seats', label: 'Seats' }, { key: 'total', label: 'Monthly Estimate', render: row => { const base = row.unitPrice * row.seats; const offer = discounts.find(d => d.code === row.discountCode); return `$${Math.max(0, base - (offer ? offer.type === 'Percentage' ? base * offer.value / 100 : offer.value : 0)).toFixed(2)}`; } }, { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> }]} /></section>
  </div>;
}

