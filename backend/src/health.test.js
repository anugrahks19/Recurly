import test from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_CLIENT ||= 'pg';
process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5432/unused';
const {scoreSubscriptions}=await import('./health.js');
const {discountEligible,discountBase,discountAmount}=await import('./discounts.js');

test('subscription health gives reasons for overdue and uncertain payment risk',()=>{
  const accounts=scoreSubscriptions({subscriptions:[{id:'s',customer_id:'c',status:'Active',auto_renew:true}],invoices:[{id:'i',subscription_id:'s',number:'INV-1',status:'Confirmed',due_date:'2026-01-01'}],payments:[{invoice_id:'i',status:'Unknown'}],now:new Date('2026-02-01')});
  assert.equal(accounts[0].score,55);
  assert.equal(accounts[0].risk,'Medium');
  assert.equal(accounts[0].reasons.length,2);
});

test('product discount applies only to eligible product lines',()=>{
  const discount={active:true,scope:'product',product_id:'p1',plan_id:null,starts_at:null,ends_at:null,usage_limit:null,times_used:0,minimum_cents:500,minimum_quantity:2,kind:'percent',value:10};
  const context={planId:'plan',amountCents:3000,quantity:1,productLines:[{product_id:'p1',quantity:2,total_cents:1000},{product_id:'p2',quantity:1,total_cents:2000}]};
  assert.equal(discountEligible(discount,context),true);
  assert.equal(discountBase(discount,context).amountCents,1000);
  assert.equal(discountAmount(discount,1000),100);
});
