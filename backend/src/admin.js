import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { asyncRoute, audit, cents, date, hashSecret, httpError, id, money, parse, requireRole } from './lib.js';
import { generateDueInvoices } from './billing.js';

export const admin = Router();
admin.use(requireRole('admin'));
admin.get('/workspace', asyncRoute(async (_req, res) => {
  const [users, plans, products, subscriptions, invoices, payments, discounts, quotations, cases, messages, logs] = await Promise.all([
    db('users').select('id','name','email','role','active','company','created_at'), db('plans').orderBy('created_at','desc'), db('products').orderBy('created_at','desc'), db('subscriptions').orderBy('created_at','desc').limit(500),
    db('invoices').orderBy('created_at','desc').limit(500), db('payments').orderBy('paid_at','desc').limit(500), db('discounts').orderBy('created_at','desc'), db('quotations').orderBy('created_at','desc').limit(500), db('support_cases').orderBy('created_at','desc').limit(500), db('admin_messages').orderBy('created_at','desc').limit(500), db('audit_logs').orderBy('created_at','desc').limit(200),
  ]);
  const customerById = Object.fromEntries(users.map(u => [u.id,u]));
  const planById = Object.fromEntries(plans.map(p => [p.id,p]));
  res.json({
    summary: { customers: users.filter(u => u.role === 'user').length, staff: users.filter(u => u.role === 'staff').length, activeSubscriptions: subscriptions.filter(s => s.status === 'Active').length, revenue: money(payments.filter(p => p.status === 'Successful').reduce((sum,p) => sum + p.amount_cents,0)), overdueInvoices: invoices.filter(i => i.status === 'Confirmed' && new Date(i.due_date) < new Date()).length },
    staff: users.filter(u => u.role === 'staff'), customers: users.filter(u => u.role === 'user'),
    plans: plans.map(p => ({ id:p.id,name:p.name,daily:p.daily_cents===null?'':money(p.daily_cents),weekly:p.weekly_cents===null?'':money(p.weekly_cents),monthly:money(p.monthly_cents),annual:money(p.annual_cents),status:p.active?'Active':'Inactive',description:p.description })),
    products: products.map(p => ({ id:p.id,name:p.name,type:p.type,price:money(p.sales_price_cents),cost:money(p.cost_cents),status:p.active?'Active':'Inactive' })),
    subscriptions: subscriptions.map(s => ({ id:s.id,customerId:s.customer_id,customer:customerById[s.customer_id]?.name,plan:planById[s.plan_id]?.name,status:s.status,amount:money(s.amount_cents),nextBillingAt:s.next_billing_at?date(s.next_billing_at):'' })),
    invoices: invoices.map(i => ({ id:i.id,customerId:i.customer_id,customer:customerById[i.customer_id]?.name,status:i.status,amount:money(i.total_cents),dueDate:date(i.due_date) })),
    payments: payments.map(p => ({ id:p.id,customerId:p.customer_id,customer:customerById[p.customer_id]?.name,invoiceId:p.invoice_id,status:p.status,amount:money(p.amount_cents),date:date(p.paid_at),method:p.method })),
    coupons: discounts.map(d => ({ id:d.id,code:d.code,kind:d.kind,value:d.kind==='fixed'?money(d.value):d.value,status:d.active?'Active':'Inactive',expiresAt:d.ends_at?date(d.ends_at):'' })),
    quotations, queries:cases, requests:messages, auditLogs:logs,
  });
}));
admin.post('/staff', asyncRoute(async (req, res) => {
  const body = parse(z.object({ name:z.string().trim().min(2).max(160), email:z.email(), password:z.string().min(12).max(128), specialId:z.string().min(12).max(128) }), req.body);
  if (await db('users').where({ email:body.email.toLowerCase() }).first()) throw httpError(409,'Email already registered.');
  const userId=id(); await db.transaction(async trx => { await trx('users').insert({ id:userId,name:body.name,email:body.email.toLowerCase(),password_hash:await hashSecret(body.password),special_id_hash:await hashSecret(body.specialId),role:'staff' }); await audit(trx,req.user.id,'staff.create','user',userId); }); res.status(201).json({ id:userId });
}));
admin.post('/plans', asyncRoute(async (req,res) => { const b=parse(z.object({ name:z.string().trim().min(2).max(160), description:z.string().max(2000).default(''), daily:z.number().nonnegative().optional(), weekly:z.number().nonnegative().optional(), monthly:z.number().nonnegative(), annual:z.number().nonnegative(), trialDays:z.number().int().min(0).max(365).default(0), features:z.array(z.string().max(160)).default([]) }),req.body); const planId=id(); await db('plans').insert({ id:planId,name:b.name,description:b.description,daily_cents:b.daily===undefined?null:cents(b.daily),weekly_cents:b.weekly===undefined?null:cents(b.weekly),monthly_cents:cents(b.monthly),annual_cents:cents(b.annual),trial_days:b.trialDays,features_json:JSON.stringify(b.features) }); res.status(201).json({ id:planId }); }));
admin.post('/products', asyncRoute(async (req,res) => { const b=parse(z.object({ name:z.string().trim().min(2).max(160),type:z.string().max(40),price:z.number().nonnegative(),cost:z.number().nonnegative().default(0),notes:z.string().max(5000).default('') }),req.body); const productId=id(); await db('products').insert({ id:productId,name:b.name,type:b.type,sales_price_cents:cents(b.price),cost_cents:cents(b.cost),notes:b.notes }); res.status(201).json({ id:productId }); }));
admin.post('/subscriptions', asyncRoute(async (req,res) => {
  const b=parse(z.object({customerId:z.string().uuid(),planId:z.string().uuid(),interval:z.enum(['daily','weekly','monthly','annual']),discountCode:z.string().max(60).optional()}),req.body);
  const [customer,plan]=await Promise.all([db('users').where({id:b.customerId,role:'user',active:true}).first(),db('plans').where({id:b.planId,active:true}).first()]);
  if(!customer||!plan) throw httpError(400,'Customer or plan unavailable.');
  const discount=b.discountCode ? await db('discounts').where({code:b.discountCode.toUpperCase(),active:true}).first():null;
  if(b.discountCode&&!discount) throw httpError(400,'Discount unavailable.');
  const amount=plan[`${b.interval}_cents`]; if(amount===null||amount===undefined) throw httpError(400,'That billing interval is not available for this plan.');
  const subId=id(); const today=new Date();
  await db.transaction(async trx => { await trx('subscriptions').insert({id:subId,number:`SUB-${subId.slice(0,8).toUpperCase()}`,customer_id:customer.id,plan_id:plan.id,discount_id:discount?.id||null,interval:b.interval,status:'Active',amount_cents:amount,started_at:today,next_billing_at:today,auto_renew:true}); await audit(trx,req.user.id,'subscription.create','subscription',subId); });
  res.status(201).json({id:subId});
}));
admin.post('/billing/run', asyncRoute(async (req,res) => res.json(await generateDueInvoices(req.user.id))));
admin.post('/coupons', asyncRoute(async (req,res) => { const b=parse(z.object({ code:z.string().trim().min(2).max(60),kind:z.enum(['fixed','percent']),value:z.number().positive(),minimum:z.number().nonnegative().default(0),minimumQuantity:z.number().int().min(1).default(1),scope:z.enum(['subscription','product']).default('subscription'),planId:z.string().uuid().optional(),startsAt:z.string().optional(),endsAt:z.string().optional(),usageLimit:z.number().int().positive().optional() }),req.body); if(b.kind==='percent'&&b.value>100) throw httpError(400,'Percentage cannot exceed 100.'); const discountId=id(); await db('discounts').insert({ id:discountId,code:b.code.toUpperCase(),kind:b.kind,value:b.kind==='fixed'?cents(b.value):b.value,minimum_cents:cents(b.minimum),minimum_quantity:b.minimumQuantity,scope:b.scope,plan_id:b.planId||null,starts_at:b.startsAt||null,ends_at:b.endsAt||null,usage_limit:b.usageLimit||null }); res.status(201).json({id:discountId}); }));
admin.post('/invoices/:id/confirm', asyncRoute(async (req,res) => { const count=await db('invoices').where({id:req.params.id,status:'Draft'}).update({status:'Confirmed',updated_at:new Date()}); if(!count) throw httpError(409,'Only draft invoices can be confirmed.'); res.json({ok:true}); }));
admin.post('/invoices/:id/cancel', asyncRoute(async (req,res) => { const count=await db('invoices').where({id:req.params.id}).whereIn('status',['Draft','Confirmed']).update({status:'Cancelled',updated_at:new Date()}); if(!count) throw httpError(409,'Invoice cannot be cancelled.'); res.json({ok:true}); }));
admin.post('/payments', asyncRoute(async (req,res) => {
  const b=parse(z.object({ invoiceId:z.string().uuid(), amount:z.number().positive(), method:z.string().trim().min(2).max(100), note:z.string().max(2000).default(''), externalReference:z.string().max(120).optional() }),req.body);
  const invoice=await db('invoices').where({id:b.invoiceId}).first(); if(!invoice||!['Confirmed','Paid'].includes(invoice.status)) throw httpError(400,'Confirmed invoice not found.');
  const paymentId=id(); await db.transaction(async trx => { await trx('invoices').where({id:invoice.id}).forUpdate().first(); const paid=await trx('payments').where({invoice_id:invoice.id,status:'Successful'}).sum({amount:'amount_cents'}).first(); if(Number(paid.amount||0)+cents(b.amount)>invoice.total_cents) throw httpError(400,'Payment exceeds invoice balance.'); await trx('payments').insert({id:paymentId,invoice_id:invoice.id,customer_id:invoice.customer_id,amount_cents:cents(b.amount),method:b.method,status:'Successful',external_reference:b.externalReference||null,note:b.note,paid_at:new Date()}); if(Number(paid.amount||0)+cents(b.amount)===invoice.total_cents) await trx('invoices').where({id:invoice.id}).update({status:'Paid',updated_at:new Date()}); await audit(trx,req.user.id,'payment.record','invoice',invoice.id,{paymentId,amount:b.amount}); }); res.status(201).json({id:paymentId});
}));

