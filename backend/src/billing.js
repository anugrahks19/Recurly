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
      if (await trx('invoices').where({ subscription_id:sub.id, period_start:periodStart }).first()) { await trx('subscriptions').where({id:sub.id}).update({next_billing_at:periodEnd}); return; }
      const discount=sub.discount_id ? await trx('discounts').where({id:sub.discount_id,active:true}).first() : null;
      const validDiscount=discount && (!discount.starts_at||new Date(discount.starts_at)<=new Date()) && (!discount.ends_at||new Date(discount.ends_at)>=new Date()) && (!discount.usage_limit||discount.times_used<discount.usage_limit) && sub.amount_cents>=discount.minimum_cents;
      const discountCents=validDiscount ? Math.min(sub.amount_cents,discount.kind==='percent' ? Math.round(sub.amount_cents*discount.value/100) : discount.value) : 0;
      const tax=await trx('tax_rules').where({active:true}).orderBy('id').first();
      const taxCents=tax ? Math.round((sub.amount_cents-discountCents)*tax.rate_basis_points/10000) : 0;
      const invoiceId=id();
      await trx('invoices').insert({id:invoiceId,number:`INV-${invoiceId.slice(0,8).toUpperCase()}`,customer_id:sub.customer_id,subscription_id:sub.id,period_start:periodStart,period_end:periodEnd,status:'Draft',subtotal_cents:sub.amount_cents,discount_cents:discountCents,tax_cents:taxCents,total_cents:sub.amount_cents-discountCents+taxCents,due_date:periodStart});
      await trx('invoice_lines').insert({id:id(),invoice_id:invoiceId,description:`${sub.interval} subscription`,quantity:1,unit_cents:sub.amount_cents,total_cents:sub.amount_cents});
      await trx('subscriptions').where({id:sub.id}).update({next_billing_at:periodEnd,updated_at:new Date()});
      if(validDiscount) await trx('discounts').where({id:discount.id}).increment('times_used',1);
      await trx('notifications').insert({id:id(),user_id:sub.customer_id,type:'invoice',title:'New invoice available',detail:`Invoice for ${periodStart} is ready.`});
      await audit(trx,actorId,'invoice.generate','invoice',invoiceId,{subscriptionId:sub.id,periodStart});
      created++;
    });
  }
  return {scanned:due.length,created};
}
