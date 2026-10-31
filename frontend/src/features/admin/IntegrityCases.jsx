import React, { useEffect, useState } from 'react';

const base = import.meta.env.VITE_API_BASE_URL || '';
async function request(path, options = {}) {
  const response = await fetch(`${base}/api/admin/integrity${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Request failed.');
  return body;
}

export function IntegrityCases() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [health, setHealth] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState({ invoiceId: '', amount: '', method: '', externalReference: '', status: 'Unknown', note: '' });
  async function refresh() { try { const [cases, scores]=await Promise.all([request(`/?page=${page}`),request('/health')]);setData(cases);setHealth(scores.accounts||[]);setError(''); } catch (e) { setError(e.message); } }
  useEffect(() => { refresh(); }, [page]);
  async function scan() { setBusy(true); try { await request('/scan', { method: 'POST' }); await refresh(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function resolve(item) {
    const note = window.prompt('How was this issue verified and resolved?');
    if (note === null) return;
    if (note.trim().length < 10) { setError('Enter at least 10 characters of resolution evidence.'); return; }
    setBusy(true);
    try { await request(`/${item.id}/resolve`, { method: 'POST', body: JSON.stringify({ note: note.trim() }) }); await refresh(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function recordPayment(event) {
    event.preventDefault(); setBusy(true);
    try {
      const response = await fetch(`${base}/api/admin/payment-exceptions`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payment, amount: Number(payment.amount) }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Could not record payment exception.');
      setPayment({ invoiceId: '', amount: '', method: '', externalReference: '', status: 'Unknown', note: '' });
      await scan();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function verify(item) {
    const outcome = window.prompt('Verified outcome: Successful or Failed');
    if (!outcome) return;
    const note = window.prompt('Verification evidence, including provider reference and result:');
    if (!note) return;
    setBusy(true);
    try {
      const paymentId = item.fingerprint.slice('payment:'.length);
      const response = await fetch(`${base}/api/admin/payment-exceptions/${paymentId}/verify`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outcome, note }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Verification failed.');
      await scan();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="live-admin-panel">
    <div className="live-admin-list-head"><div><h2>Revenue integrity</h2><p>Review billing discrepancies and payment exceptions. Confirm the source records before resolving a case.</p></div><button disabled={busy} onClick={scan}>{busy ? 'Working…' : 'Scan records'}</button></div>
    {error && <p role="alert" className="live-admin-error">{error}</p>}
    {data && <p><strong>{data.summary.open}</strong> open cases · Estimated impact <strong>₹{(data.summary.impactCents / 100).toFixed(2)}</strong></p>}
    <details><summary>Record uncertain or failed external payment</summary><form className="live-admin-form" onSubmit={recordPayment}>
      {[['invoiceId','Invoice ID'],['amount','Amount'],['method','Payment method'],['externalReference','Provider reference'],['note','Note']].map(([key,label]) => <label key={key}>{label}<input required={key !== 'note'} type={key === 'amount' ? 'number' : 'text'} min={key === 'amount' ? '0.01' : undefined} step={key === 'amount' ? '0.01' : undefined} value={payment[key]} onChange={e => setPayment({ ...payment, [key]: e.target.value })}/></label>)}
      <label>Status<select value={payment.status} onChange={e => setPayment({ ...payment, status: e.target.value })}><option>Unknown</option><option>Pending</option><option>Failed</option></select></label><button disabled={busy}>Record exception</button>
    </form></details>
    {data?.cases.length ? data.cases.map(item => <article key={item.id} className="live-admin-panel" style={{ marginTop: 16 }}>
      <h3>{item.kind} · {item.status}</h3>
      <p>{item.explanation}</p><p><strong>Recommended:</strong> {item.recommended_action}</p>
      <p>Estimated impact: ₹{(item.impact_cents / 100).toFixed(2)} · Customer: {item.customer_id}</p>
      {item.status === 'Open' ? <>{item.kind === 'Payment exception' && <button disabled={busy} onClick={() => verify(item)}>Verify provider outcome</button>}<button disabled={busy} onClick={() => resolve(item)}>Record resolution</button></> : <p>Resolution: {item.resolution_note}</p>}
    </article>) : <p>No cases yet. Scan records to check for issues.</p>}
    {data && <div><button disabled={page===0||busy} onClick={()=>setPage(page-1)}>Previous</button> Page {page+1} <button disabled={!data.hasMore||busy} onClick={()=>setPage(page+1)}>Next</button></div>}
    <h2>Subscription health</h2><p>Explainable risk signals from overdue invoices, payment exceptions, renewal settings, and upcoming expiry.</p>
    {health.length ? <div className="live-admin-table-wrap"><table><thead><tr><th>Subscription</th><th>Customer</th><th>Score</th><th>Risk</th><th>Reasons</th></tr></thead><tbody>{health.slice(0,20).map(item=><tr key={item.subscriptionId}><td>{item.subscriptionId}</td><td>{item.customerId}</td><td>{item.score}</td><td>{item.risk}</td><td>{item.reasons.join(' ')||'No current risk signals.'}</td></tr>)}</tbody></table></div> : <p>No active subscriptions to score.</p>}
  </section>;
}
