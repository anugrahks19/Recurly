import test from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_CLIENT ||= 'pg';
process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5432/unused';
const { identifyIssues } = await import('./integrity.js');

test('integrity scan identifies due invoices, arithmetic, and uncertain payments', () => {
  const subscriptions=[{id:'s1',number:'SUB-1',customer_id:'c1',plan_id:'plan1',status:'Active',next_billing_at:'2026-10-01',amount_cents:1000}];
  const invoices=[{id:'i1',number:'INV-1',subscription_id:'s1',customer_id:'c1',period_start:'2026-09-01',created_at:'2026-09-01',status:'Confirmed',subtotal_cents:1000,discount_cents:0,tax_cents:100,total_cents:1200}];
  const payments=[{id:'p1',invoice_id:'i1',customer_id:'c1',amount_cents:1200,status:'Unknown',external_reference:'provider-123'}];
  const issues=identifyIssues({subscriptions,invoices,payments,discounts:[],now:new Date('2026-10-31')});
  assert.deepEqual(issues.map(i=>i.kind),['Missing invoice','Invoice arithmetic','Payment exception']);
  assert.equal(issues[0].impact_cents,1000);
  assert.match(issues[2].recommended_action,/blocked until/);
});

test('a fully paid confirmed invoice is flagged for reconciliation', () => {
  const invoices=[{id:'i1',number:'INV-1',customer_id:'c1',status:'Confirmed',subtotal_cents:500,discount_cents:0,tax_cents:0,total_cents:500}];
  const payments=[{id:'p1',invoice_id:'i1',customer_id:'c1',status:'Successful',amount_cents:500}];
  const issues=identifyIssues({subscriptions:[],invoices,payments,discounts:[]});
  assert.equal(issues.length,1);
  assert.equal(issues[0].kind,'Unmatched payment');
});
