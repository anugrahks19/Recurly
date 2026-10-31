import { db } from './db.js';
import { audit, date, id } from './lib.js';
import { nextPeriod } from './period.js';
import { discountEligible, discountAmount, discountBase } from './discounts.js';

export async function generateDueInvoices(actorId) {
  const due = await db('subscriptions').where({ status: 'Active' }).where('next_billing_at','<=',new Date()).orderBy('next_billing_at').limit(500);
  let created = 0;
  for (const item of due) {
    await db.transaction(async trx => {
      const sub = await trx('subscriptions').where({ id:item.id }).forUpdate().first();
      if (!sub || sub.status !== 'Active' || !sub.next_billing_at || new Date(sub.next_billing_at)>new Date()) return;
      const periodStart=date(sub.next_billing_at);
      const periodEnd=nextPeriod(sub.next_billing_at,sub.interval,new Date(sub.started_at).getUTCDate());
      const plan=await trx('plans').where({id:sub.plan_id}).first();
      if (sub.expires_on && periodStart > date(sub.expires_on)) {
        await trx('subscriptions').where({id:sub.id}).update({status:'Closed',next_billing_at:null,ended_at:new Date(),updated_at:new Date()});
        await audit(trx,actorId,'subscription.expire','subscription',sub.id);
        return;
      }
      if (await trx('invoices').where({ subscription_id:sub.id, period_start:periodStart }).first()) { await trx('subscriptions').where({id:sub.id}).update({next_billing_at:periodEnd}); return; }
      const productLines=await trx('subscription_lines').where({subscription_id:sub.id});
      const context={planId:sub.plan_id,amountCents:sub.amount_cents,quantity:sub.quantity,productLines};
      let discount=sub.discount_id ? await trx('discounts').where({id:sub.discount_id,active:true}).forUpdate().first() : null;
      if(!discount) {
        const candidates=await trx('discounts').where({active:true}).whereIn('scope',['subscription','product']).where(q=>q.whereNull('plan_id').orWhere({plan_id:sub.plan_id}));
        const best=candidates.filter(d=>discountEligible(d,context)).sort((a,b)=>discountAmount(b,discountBase(b,context).amountCents)-discountAmount(a,discountBase(a,context).amountCents))[0];
        if(best) discount=await trx('discounts').where({id:best.id}).forUpdate().first();
      }
      const validDiscount=discountEligible(discount,context);
      const discountCents=validDiscount ? discountAmount(discount,discountBase(discount,context).amountCents) : 0;
      const tax=await trx('tax_rules').where({active:true}).orderBy('id').first();
      const productSubtotal=productLines.reduce((sum,l)=>sum+Number(l.total_cents),0);
      const planSubtotal=sub.amount_cents-productSubtotal;
      if(planSubtotal<0) throw new Error('Subscription line amounts exceed the subscription total.');
      const taxableBasis=planSubtotal*(tax?.rate_basis_points||0)+productLines.reduce((sum,l)=>sum+Number(l.total_cents)*Number(l.tax_basis_points),0);
      const eligibleTaxBasis=validDiscount&&discount.scope==='product' ? productLines.filter(l=>l.product_id===discount.product_id).reduce((sum,l)=>sum+Number(l.total_cents)*Number(l.tax_basis_points),0) : taxableBasis;
      const eligibleAmount=validDiscount?discountBase(discount,context).amountCents:0;
      const discountTaxBasis=eligibleAmount?discountCents*eligibleTaxBasis/eligibleAmount:0;
      const taxCents=Math.round((taxableBasis-discountTaxBasis)/10000);
      const invoiceId=id();
      const dueDate=new Date(`${periodStart}T00:00:00Z`); dueDate.setUTCDate(dueDate.getUTCDate()+sub.payment_terms_days);
      await trx('invoices').insert({id:invoiceId,number:`INV-${invoiceId.slice(0,8).toUpperCase()}`,customer_id:sub.customer_id,subscription_id:sub.id,discount_id:validDiscount?discount.id:null,period_start:periodStart,period_end:periodEnd,status:'Draft',subtotal_cents:sub.amount_cents,discount_cents:discountCents,tax_cents:taxCents,total_cents:sub.amount_cents-discountCents+taxCents,due_date:date(dueDate)});
      await trx('invoice_lines').insert([{id:id(),invoice_id:invoiceId,description:`${plan?.name||'Plan'} - ${sub.interval} subscription`,quantity:sub.quantity,unit_cents:Math.round(planSubtotal/sub.quantity),total_cents:planSubtotal},...productLines.map(l=>({id:id(),invoice_id:invoiceId,description:l.description,quantity:l.quantity,unit_cents:l.unit_cents,total_cents:l.total_cents}))]);
      const expires = sub.expires_on && periodEnd > date(sub.expires_on);
      const stops = expires || !sub.auto_renew;
      const closes = stops && !!plan?.auto_close;
      await trx('subscriptions').where({id:sub.id}).update({next_billing_at:stops?null:periodEnd,status:closes?'Closed':'Active',ended_at:closes?new Date():null,updated_at:new Date()});
      if(validDiscount) await trx('discounts').where({id:discount.id}).increment('times_used',1);
      await trx('notifications').insert({id:id(),user_id:sub.customer_id,type:'invoice',title:'New invoice available',detail:`Invoice for ${periodStart} is ready.`});
      await audit(trx,actorId,'invoice.generate','invoice',invoiceId,{subscriptionId:sub.id,periodStart});
      created++;
    });
  }
  return {scanned:due.length,created};
}
