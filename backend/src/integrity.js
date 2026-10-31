import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { asyncRoute, audit, date, httpError, id, parse } from './lib.js';
import { scoreSubscriptions } from './health.js';

export const integrity = Router();

integrity.get('/health',asyncRoute(async(_req,res)=>{
  const [subscriptions,invoices,payments]=await Promise.all([db('subscriptions').where({status:'Active'}),db('invoices'),db('payments')]);
  res.json({accounts:scoreSubscriptions({subscriptions,invoices,payments}).slice(0,100)});
}));

export function identifyIssues({subscriptions, subscriptionLines = [], invoices, payments, discounts, now = new Date()}) {
  const issues=[];
  const invoiceByPeriod=new Set(invoices.filter(i=>i.subscription_id&&i.period_start).map(i=>`${i.subscription_id}:${date(i.period_start)}`));
  const subById=new Map(subscriptions.map(s=>[s.id,s]));
  const discountById=new Map(discounts.map(d=>[d.id,d]));
  const productsBySubscription=new Map();for(const line of subscriptionLines){if(!productsBySubscription.has(line.subscription_id)) productsBySubscription.set(line.subscription_id,new Set());productsBySubscription.get(line.subscription_id).add(line.product_id);}
  const paidByInvoice=new Map();
  for(const p of payments) if(p.status==='Successful') paidByInvoice.set(p.invoice_id,(paidByInvoice.get(p.invoice_id)||0)+Number(p.amount_cents));
  for(const s of subscriptions) {
    if(s.status==='Active'&&s.next_billing_at&&new Date(s.next_billing_at)<=now&&!invoiceByPeriod.has(`${s.id}:${date(s.next_billing_at)}`)) {
      issues.push({fingerprint:`missing:${s.id}:${date(s.next_billing_at)}`,kind:'Missing invoice',subscription_id:s.id,invoice_id:null,customer_id:s.customer_id,impact_cents:Number(s.amount_cents),explanation:`Subscription ${s.number} was due on ${date(s.next_billing_at)}, but that period has no invoice. Estimated pre-discount amount: ${s.amount_cents} cents.`,recommended_action:'Run billing, then verify the new invoice and confirm it before sending.'});
    }
  }
  for(const i of invoices) {
    if(i.status==='Cancelled') continue;
    const s=subById.get(i.subscription_id);
    if(s&&Number(i.subtotal_cents)!==Number(s.amount_cents)) {
      issues.push({fingerprint:`amount:${i.id}`,kind:'Amount mismatch',subscription_id:s.id,invoice_id:i.id,customer_id:i.customer_id,impact_cents:Math.abs(Number(i.subtotal_cents)-Number(s.amount_cents)),explanation:`Invoice ${i.number} subtotal is ${i.subtotal_cents} cents; subscription ${s.number} currently specifies ${s.amount_cents} cents. This may be a legitimate historical plan change.`,recommended_action:'Compare the invoice with the approved terms effective for this billing period before adjusting it.'});
    }
    if(Number(i.total_cents)!==Number(i.subtotal_cents)-Number(i.discount_cents)+Number(i.tax_cents)) {
      issues.push({fingerprint:`arithmetic:${i.id}`,kind:'Invoice arithmetic',subscription_id:i.subscription_id,invoice_id:i.id,customer_id:i.customer_id,impact_cents:Math.abs(Number(i.total_cents)-(Number(i.subtotal_cents)-Number(i.discount_cents)+Number(i.tax_cents))),explanation:`Invoice ${i.number} total does not equal subtotal minus discount plus tax.`,recommended_action:'Review the invoice lines and tax calculation; correct the invoice before collecting payment.'});
    }
    if(Number(i.discount_cents)>0) {
      const d=discountById.get(i.discount_id);
      const created=new Date(i.created_at);
      if(!d || !['subscription','product'].includes(d.scope) || (d.scope==='product'&&!productsBySubscription.get(i.subscription_id)?.has(d.product_id)) || (d.plan_id&&d.plan_id!==s?.plan_id) || (d.starts_at&&date(d.starts_at)>date(created)) || (d.ends_at&&date(d.ends_at)<date(created))) {
        issues.push({fingerprint:`discount:${i.id}`,kind:'Invalid discount',subscription_id:i.subscription_id,invoice_id:i.id,customer_id:i.customer_id,impact_cents:Number(i.discount_cents),explanation:`Invoice ${i.number} contains a discount that cannot be matched to an eligible rule at creation.`,recommended_action:'Verify the historical discount approval and correct the invoice if it was not authorized.'});
      }
    }
    if(i.status==='Confirmed'&&paidByInvoice.get(i.id)>=Number(i.total_cents)) {
      issues.push({fingerprint:`unmatched:${i.id}`,kind:'Unmatched payment',subscription_id:i.subscription_id,invoice_id:i.id,customer_id:i.customer_id,impact_cents:Number(i.total_cents),explanation:`Successful payments cover invoice ${i.number}, but it is still marked Confirmed.`,recommended_action:'Verify external references and payment amounts, then reconcile the invoice status.'});
    }
  }
  for(const p of payments) if(['Failed','Unknown','Pending'].includes(p.status)) {
    const i=invoices.find(x=>x.id===p.invoice_id);
    issues.push({fingerprint:`payment:${p.id}`,kind:'Payment exception',subscription_id:i?.subscription_id||null,invoice_id:p.invoice_id,customer_id:p.customer_id,impact_cents:Number(p.amount_cents),explanation:`Payment ${p.id} is ${p.status}; external reference ${p.external_reference||'not supplied'}. Outcome must be verified before retrying.`,recommended_action:'Check the payment provider using the external reference. Keep automatic retries blocked until the result is confirmed.'});
  }
  return issues;
}

integrity.get('/',asyncRoute(async (req,res)=>{
  const {page}=parse(z.object({page:z.coerce.number().int().min(0).max(100000).default(0)}),req.query);
  const [rows,summary]=await Promise.all([db('integrity_cases').orderBy('created_at','desc').limit(101).offset(page*100),db('integrity_cases').where({status:'Open'}).count({count:'id'}).sum({impact:'impact_cents'}).first()]);
  res.json({summary:{open:Number(summary.count||0),impactCents:Number(summary.impact||0)},cases:rows.slice(0,100),page,hasMore:rows.length>100});
}));

integrity.post('/scan',asyncRoute(async (req,res)=>{
  const [subscriptions,subscriptionLines,invoices,payments,discounts]=await Promise.all([db('subscriptions'),db('subscription_lines'),db('invoices'),db('payments'),db('discounts')]);
  const issues=identifyIssues({subscriptions,subscriptionLines,invoices,payments,discounts});
  await db.transaction(async trx=>{
    for(const issue of issues) await trx('integrity_cases').insert({id:id(),...issue,status:'Open'}).onConflict('fingerprint').merge({kind:issue.kind,impact_cents:issue.impact_cents,explanation:issue.explanation,recommended_action:issue.recommended_action,updated_at:new Date()});
    await audit(trx,req.user.id,'integrity.scan','integrity_case',null,{found:issues.length});
  });
  res.json({found:issues.length});
}));

integrity.post('/:id/resolve',asyncRoute(async(req,res)=>{
  const {note}=parse(z.object({note:z.string().trim().min(10).max(2000)}),req.body);
  await db.transaction(async trx=>{
    const row=await trx('integrity_cases').where({id:req.params.id,status:'Open'}).forUpdate().first();
    if(!row) throw httpError(409,'Open case not found.');
    await trx('integrity_cases').where({id:row.id}).update({status:'Resolved',resolution_note:note,resolved_by:req.user.id,resolved_at:new Date(),updated_at:new Date()});
    await audit(trx,req.user.id,'integrity.resolve','integrity_case',row.id,{note});
  });
  res.json({ok:true});
}));
