import React, { useEffect, useState } from 'react';

const base=import.meta.env.VITE_API_BASE_URL||'';
export function AdminReports({ customers=[], plans=[] }) {
  const [filters,setFilters]=useState({from:'',to:'',customerId:'',planId:''});
  const [report,setReport]=useState(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function load(selected=filters) {
    setBusy(true); setError('');
    try {
      const params=new URLSearchParams(Object.entries(selected).filter(([,value])=>value));
      const response=await fetch(`${base}/api/admin/reports?${params}`,{credentials:'include'});
      const data=await response.json();
      if(!response.ok) throw new Error(data.message||'Report unavailable.');
      setReport(data);
    } catch(err) { setError(err.message); } finally { setBusy(false); }
  }
  useEffect(()=>{ load({}); },[]);
  return <>
    <section className="live-admin-panel"><h2>Filter report</h2><form className="live-admin-form" onSubmit={event=>{event.preventDefault();load();}}>
      <label>From<input type="date" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})}/></label>
      <label>To<input type="date" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})}/></label>
      <label>Customer<select value={filters.customerId} onChange={e=>setFilters({...filters,customerId:e.target.value})}><option value="">All customers</option>{customers.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
      <label>Plan<select value={filters.planId} onChange={e=>setFilters({...filters,planId:e.target.value})}><option value="">All plans</option>{plans.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
      <button disabled={busy}>{busy?'Loading…':'Apply filters'}</button>
    </form><p>Amounts use invoice creation and payment dates. Active subscriptions are the current count for the selected customer and plan.</p></section>
    {error&&<p className="live-admin-error" role="alert">{error}</p>}
    {report&&<div className="live-admin-stats">{[
      ['Active subscriptions',report.activeSubscriptions],['Invoices',report.invoiceCount],['Invoiced',`₹${report.invoicedAmount.toFixed(2)}`],
      ['Payments',report.paymentCount],['Collected',`₹${report.collectedAmount.toFixed(2)}`],['Overdue invoices',report.overdueInvoices],
    ].map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>}
  </>;
}
