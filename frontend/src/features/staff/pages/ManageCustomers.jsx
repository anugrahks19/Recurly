import React, { useMemo, useState } from 'react';
import { DataTable, EmptyState, Icon, PageHeader, StatusBadge } from '../../../shared/components/Ui.jsx';
import { useStaffData } from '../components/StaffDataProvider.jsx';

const blank = { name: '', email: '', company: '', plan: 'Studio', status: 'Active', renewal: '', notes: '' };

export function ManageCustomers() {
  const { customers, update } = useStaffData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState('');
  const filtered = useMemo(() => customers.filter(row => (status === 'All Statuses' || row.status === status) && `${row.name} ${row.email} ${row.company} ${row.id}`.toLowerCase().includes(search.toLowerCase())), [customers, search, status]);
  function open(row) { setSelected(row ?? 'new'); setForm(row ? { ...row } : { ...blank }); setMessage(''); }
  async function save(event) {
    event.preventDefault();
    if (customers.some(row => row.email.toLowerCase() === form.email.trim().toLowerCase() && row.id !== form.id)) { setMessage('This email already belongs to a customer.'); return; }
    try { await update('customers', { ...form, name: form.name.trim(), email: form.email.trim(), company: form.company.trim() }); setSelected(null); }
    catch (err) { setMessage(err.message); }
  }
  return <div className="page-wrap"><PageHeader eyebrow="Staff view · customers" title="Manage Customer" description="Search accounts and update customer contact records. Customers create their own accounts through signup." />
    <section className="panel"><div className="toolbar"><div className="panel-heading compact"><div><span className="section-mark"><i /><i /></span><h2>Customer Registry</h2><span className="subtle-pill">{filtered.length} Records</span></div></div><div className="filters"><label className="search-field"><Icon name="search" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, email or ID" aria-label="Search customers" /></label><select aria-label="Filter by status" value={status} onChange={event => setStatus(event.target.value)}><option>All Statuses</option><option>Active</option><option>Past Due</option><option>Paused</option></select></div></div>
    <DataTable data={filtered} columns={[
      { key: 'name', label: 'Customer', render: row => <div className="person-cell"><span className="initials">{row.name.split(' ').map(p => p[0]).join('').slice(0, 2)}</span><div><strong>{row.name}</strong><small>{row.email}</small></div></div> },
      { key: 'company', label: 'Company' }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
      { key: 'renewal', label: 'Renewal' }, { key: 'action', label: 'Actions', render: row => <button className="table-button" onClick={() => open(row)}>Manage</button> },
    ]} emptyMessage="No customers match those filters." /></section>
    {selected && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="customer-title"><div className="modal-head"><div><span className="eyebrow">Customer record</span><h2 id="customer-title">{selected === 'new' ? 'Add Customer' : 'Manage Customer'}</h2></div><button className="icon-button" aria-label="Close" onClick={() => setSelected(null)}><Icon name="close" /></button></div><form onSubmit={save}><div className="form-grid"><label>Full name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Company<input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></label><label>Plan<input value={form.plan || ""} readOnly /></label><label>Status<input value={form.status || ""} readOnly /></label><label>Renewal date<input value={form.renewal || ""} readOnly /></label><label className="full-span">Internal notes<textarea rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label></div>{message && <p className="form-error" role="alert">{message}</p>}<div className="form-actions"><button type="button" className="button button-outline" onClick={() => setSelected(null)}>Cancel</button><button type="submit" className="button button-primary">Save Customer</button></div></form></section></div>}
  </div>;
}

