import { db } from './db.js';
import { audit, date, id } from './lib.js';
import { nextPeriod } from './period.js';

export async function generateDueInvoices(actorId) {
  const due = await db('subscriptions').where({ status: 'Active', auto_renew: true }).where('next_billing_at','<=',new Date()).orderBy('next_billing_at').limit(500);
  let created = 0;
  for (const item of due) {
    await db.transaction(async trx => {
      const sub = await trx('subscriptions').where({ id:item.id }).forUpdate().first();
      if (!sub || sub.status !== 'Active' || !sub.auto_renew || new Date(sub.next_billing_at)>new Date()) return;
      const periodStart=date(sub.next_billing_at);
      const periodEnd=nextPeriod(sub.next_billing_at,sub.interval,new Date(sub.started_at).getUTCDate());
      const plan=await trx('plans').where({id:sub.plan_id}).first();
      if (await trx('invoices').where({ subscription_id:sub.id, period_start:periodStart }).first()) { await trx('subscriptions').where({id:sub.id}).update({next_billing_at:periodEnd}); return; }
      const eligible = d => d && d.scope==='subscription' && (!d.plan_id||d.plan_id===sub.plan_id) && (!d.starts_at||new Date(d.starts_at)<=new Date()) && (!d.ends_at||date(d.ends_at)>=date(new Date())) && (!d.usage_limit||d.times_used<d.usage_limit) && sub.amount_cents>=d.minimum_cents && sub.quantity>=d.minimum_quantity;
      let discount=sub.discount_id ? await trx('discounts').where({id:sub.discount_id,active:true}).forUpdate().first() : null;
      if(!discount) {
        const candidates=await trx('discounts').where({active:true,scope:'subscription'}).where(q=>q.whereNull('plan_id').orWhere({plan_id:sub.plan_id}));
        const best=candidates.filter(eligible).sort((a,b)=>{
          const value=d=>d.kind==='percent'?Math.round(sub.amount_cents*d.value/100):d.value;
          return value(b)-value(a);
        })[0];
        if(best) discount=await trx('discounts').where({id:best.id}).forUpdate().first();
      }
      const validDiscount=eligible(discount);
      const discountCents=validDiscount ? Math.min(sub.amount_cents,discount.kind==='percent' ? Math.round(sub.amount_cents*discount.value/100) : discount.value) : 0;
      const tax=await trx('tax_rules').where({active:true}).orderBy('id').first();
      const taxCents=tax ? Math.round((sub.amount_cents-discountCents)*tax.rate_basis_points/10000) : 0;
      const invoiceId=id();
      await trx('invoices').insert({id:invoiceId,number:`INV-${invoiceId.slice(0,8).toUpperCase()}`,customer_id:sub.customer_id,subscription_id:sub.id,period_start:periodStart,period_end:periodEnd,status:'Draft',subtotal_cents:sub.amount_cents,discount_cents:discountCents,tax_cents:taxCents,total_cents:sub.amount_cents-discountCents+taxCents,due_date:periodStart});
      await trx('invoice_lines').insert({id:id(),invoice_id:invoiceId,description:`${sub.interval} subscription`,quantity:sub.quantity,unit_cents:Math.round(sub.amount_cents/sub.quantity),total_cents:sub.amount_cents});
      await trx('subscriptions').where({id:sub.id}).update({next_billing_at:periodEnd,auto_renew:!!plan?.auto_renew,updated_at:new Date()});
      if(validDiscount) await trx('discounts').where({id:discount.id}).increment('times_used',1);
      await trx('notifications').insert({id:id(),user_id:sub.customer_id,type:'invoice',title:'New invoice available',detail:`Invoice for ${periodStart} is ready.`});
      await audit(trx,actorId,'invoice.generate','invoice',invoiceId,{subscriptionId:sub.id,periodStart});
      created++;
    });
  }
  return {scanned:due.length,created};
}
