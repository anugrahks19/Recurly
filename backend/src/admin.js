import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { asyncRoute, audit, cents, date, hashSecret, httpError, id, money, parse, publicOrigin, requireRole } from './lib.js';
import { generateDueInvoices } from './billing.js';
import { reports } from './reports.js';
import { integrity } from './integrity.js';
import { discountEligible } from './discounts.js';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

export const admin = Router();
admin.use(requireRole('admin'));
admin.use('/reports',reports);
admin.use('/integrity',integrity);
admin.get('/workspace', asyncRoute(async (_req, res) => {
  const [users, plans, products, variants, templates, templateLines, taxes, subscriptions, invoices, payments, discounts, quotations, cases, messages, logs] = await Promise.all([
    db('users').select('id','name','email','role','active','company','created_at'), db('plans').orderBy('created_at','desc'), db('products').orderBy('created_at','desc'), db('product_variants'), db('quotation_templates'), db('quotation_template_lines'), db('tax_rules'), db('subscriptions').orderBy('created_at','desc').limit(500),
    db('invoices').orderBy('created_at','desc').limit(500), db('payments').orderBy('paid_at','desc').limit(500), db('discounts').orderBy('created_at','desc'), db('quotations').orderBy('created_at','desc').limit(500), db('support_cases').orderBy('created_at','desc').limit(500), db('admin_messages').orderBy('created_at','desc').limit(500), db('audit_logs').orderBy('created_at','desc').limit(200),
  ]);
  const customerById = Object.fromEntries(users.map(u => [u.id,u]));
  const planById = Object.fromEntries(plans.map(p => [p.id,p]));
  const [customerCount,staffCount,activeCount,revenueTotal,overdueCount]=await Promise.all([
    db('users').where({role:'user'}).count({count:'id'}).first(),
    db('users').where({role:'staff'}).count({count:'id'}).first(),
    db('subscriptions').where({status:'Active'}).count({count:'id'}).first(),
    db('payments').where({status:'Successful'}).sum({cents:'amount_cents'}).first(),
    db('invoices').where({status:'Confirmed'}).where('due_date','<',date(new Date())).count({count:'id'}).first(),
  ]);
  res.json({
    summary: { customers:Number(customerCount.count||0),staff:Number(staffCount.count||0),activeSubscriptions:Number(activeCount.count||0),revenue:money(revenueTotal.cents),overdueInvoices:Number(overdueCount.count||0) },
    staff: users.filter(u => u.role === 'staff'), customers: users.filter(u => u.role === 'user'),
    plans: plans.map(p => ({ id:p.id,name:p.name,daily:p.daily_cents===null?'':money(p.daily_cents),weekly:p.weekly_cents===null?'':money(p.weekly_cents),monthly:money(p.monthly_cents),annual:money(p.annual_cents),minimumQuantity:p.minimum_quantity,autoClose:!!p.auto_close,canPause:!!p.can_pause,autoRenew:!!p.auto_renew,status:p.active?'Active':'Inactive',description:p.description })),
    products: products.map(p => ({ id:p.id,name:p.name,type:p.type,price:money(p.sales_price_cents),cost:money(p.cost_cents),status:p.active?'Active':'Inactive' })),
    variants: variants.map(v => ({id:v.id,productId:v.product_id,name:v.name,priceDelta:money(v.price_delta_cents)})),
    templates: templates.map(t => ({id:t.id,name:t.name,validityDays:t.validity_days,terms:t.terms,status:t.active?'Active':'Inactive'})),
    templateLines: templateLines.map(l=>({id:l.id,templateId:l.template_id,productId:l.product_id,variantId:l.variant_id||'',quantity:l.quantity})),
    taxes: taxes.map(t => ({id:t.id,name:t.name,rate:t.rate_basis_points/100,status:t.active?'Active':'Inactive'})),
    subscriptions: subscriptions.map(s => ({ id:s.id,customerId:s.customer_id,customer:customerById[s.customer_id]?.name,plan:planById[s.plan_id]?.name,status:s.status,quantity:s.quantity,amount:money(s.amount_cents),nextBillingAt:s.next_billing_at?date(s.next_billing_at):'',expiresOn:s.expires_on?date(s.expires_on):'',paymentTermsDays:s.payment_terms_days })),
    invoices: invoices.map(i => ({ id:i.id,number:i.number,customerId:i.customer_id,customer:customerById[i.customer_id]?.name,status:i.status,amount:money(i.total_cents),dueDate:date(i.due_date),sentAt:i.sent_at?date(i.sent_at):'' })),
    payments: payments.map(p => ({ id:p.id,customerId:p.customer_id,customer:customerById[p.customer_id]?.name,invoiceId:p.invoice_id,status:p.status,amount:money(p.amount_cents),date:date(p.paid_at),method:p.method })),
    coupons: discounts.map(d => ({ id:d.id,code:d.code,kind:d.kind,value:d.kind==='fixed'?money(d.value):d.value,scope:d.scope,productId:d.product_id||'',planId:d.plan_id||'',status:d.active?'Active':'Inactive',expiresAt:d.ends_at?date(d.ends_at):'' })),
    quotations, queries:cases, requests:messages, auditLogs:logs,
  });
}));
admin.post('/staff', asyncRoute(async (req, res) => {
  const body = parse(z.object({ name:z.string().trim().min(2).max(160), email:z.email(), password:z.string().min(12).max(128), specialId:z.string().min(12).max(128) }), req.body);
  if (await db('users').where({ email:body.email.toLowerCase() }).first()) throw httpError(409,'Email already registered.');
  const userId=id(); await db.transaction(async trx => { await trx('users').insert({ id:userId,name:body.name,email:body.email.toLowerCase(),password_hash:await hashSecret(body.password),special_id_hash:await hashSecret(body.specialId),role:'staff' }); await audit(trx,req.user.id,'staff.create','user',userId); }); res.status(201).json({ id:userId });
}));
admin.post('/plans', asyncRoute(async (req,res) => {
  const b=parse(z.object({ name:z.string().trim().min(2).max(160), description:z.string().max(2000).default(''), daily:z.number().nonnegative().optional(), weekly:z.number().nonnegative().optional(), monthly:z.number().nonnegative(), annual:z.number().nonnegative(), trialDays:z.number().int().min(0).max(365).default(0), minimumQuantity:z.number().int().min(1).default(1), availableFrom:z.iso.date().optional(), availableUntil:z.iso.date().optional(), autoClose:z.boolean().default(false), canPause:z.boolean().default(true), autoRenew:z.boolean().default(true), features:z.array(z.string().max(160)).default([]) }),req.body);
  if(b.availableFrom&&b.availableUntil&&b.availableFrom>b.availableUntil) throw httpError(400,'Plan end date must follow start date.');
  const planId=id(); await db('plans').insert({ id:planId,name:b.name,description:b.description,daily_cents:b.daily===undefined?null:cents(b.daily),weekly_cents:b.weekly===undefined?null:cents(b.weekly),monthly_cents:cents(b.monthly),annual_cents:cents(b.annual),trial_days:b.trialDays,minimum_quantity:b.minimumQuantity,available_from:b.availableFrom||null,available_until:b.availableUntil||null,auto_close:b.autoClose,can_pause:b.canPause,auto_renew:b.autoRenew,features_json:JSON.stringify(b.features) }); res.status(201).json({ id:planId });
}));
admin.post('/products', asyncRoute(async (req,res) => { const b=parse(z.object({ name:z.string().trim().min(2).max(160),type:z.string().max(40),price:z.number().nonnegative(),cost:z.number().nonnegative().default(0),notes:z.string().max(5000).default('') }),req.body); const productId=id(); await db('products').insert({ id:productId,name:b.name,type:b.type,sales_price_cents:cents(b.price),cost_cents:cents(b.cost),notes:b.notes }); res.status(201).json({ id:productId }); }));
admin.post('/variants', asyncRoute(async (req,res) => { const b=parse(z.object({productId:z.string().uuid(),name:z.string().trim().min(2).max(160),priceDelta:z.number()}),req.body); if(!await db('products').where({id:b.productId}).first()) throw httpError(404,'Product not found.'); const variantId=id(); await db('product_variants').insert({id:variantId,product_id:b.productId,name:b.name,price_delta_cents:cents(b.priceDelta)}); res.status(201).json({id:variantId}); }));
admin.post('/templates', asyncRoute(async (req,res) => { const b=parse(z.object({name:z.string().trim().min(2).max(160),validityDays:z.number().int().min(1).max(365),terms:z.string().max(5000).default('')}),req.body); const templateId=id(); await db('quotation_templates').insert({id:templateId,name:b.name,validity_days:b.validityDays,terms:b.terms}); res.status(201).json({id:templateId}); }));
admin.post('/templateLines',asyncRoute(async(req,res)=>{
  const b=parse(z.object({templateId:z.string().uuid(),productId:z.string().uuid(),variantId:z.string().uuid().optional(),quantity:z.number().int().min(1).max(10000)}),req.body);
  const [template,product,variant]=await Promise.all([db('quotation_templates').where({id:b.templateId,active:true}).first(),db('products').where({id:b.productId,active:true}).first(),b.variantId?db('product_variants').where({id:b.variantId,product_id:b.productId}).first():null]);
  if(!template||!product||(b.variantId&&!variant)) throw httpError(400,'Template, product, or variant unavailable.');
  const lineId=id(); await db('quotation_template_lines').insert({id:lineId,template_id:template.id,product_id:product.id,variant_id:variant?.id||null,quantity:b.quantity});res.status(201).json({id:lineId});
}));
admin.post('/taxes', asyncRoute(async (req,res) => { const b=parse(z.object({name:z.string().trim().min(2).max(100),rate:z.number().min(0).max(100)}),req.body); const taxId=id(); await db.transaction(async trx => { await trx('tax_rules').update({active:false}); await trx('tax_rules').insert({id:taxId,name:b.name,rate_basis_points:Math.round(b.rate*100)}); }); res.status(201).json({id:taxId}); }));
admin.post('/subscriptions', asyncRoute(async (req,res) => {
  const b=parse(z.object({customerId:z.string().uuid(),planId:z.string().uuid(),interval:z.enum(['daily','weekly','monthly','annual']),quantity:z.number().int().min(1).max(10000).default(1),discountCode:z.string().max(60).optional(),quotationId:z.string().uuid().optional(),expiresOn:z.iso.date().optional(),paymentTermsDays:z.number().int().min(0).max(365).default(0)}),req.body);
  const [customer,plan]=await Promise.all([db('users').where({id:b.customerId,role:'user',active:true}).first(),db('plans').where({id:b.planId,active:true}).first()]);
  if(!customer||!plan) throw httpError(400,'Customer or plan unavailable.');
  const currentDay=new Date().toISOString().slice(0,10);
  if((plan.available_from&&date(plan.available_from)>currentDay)||(plan.available_until&&date(plan.available_until)<currentDay)) throw httpError(400,'Plan is outside its availability window.');
  if(b.quantity<plan.minimum_quantity) throw httpError(400,`Minimum quantity is ${plan.minimum_quantity}.`);
  const discount=b.discountCode ? await db('discounts').where({code:b.discountCode.toUpperCase(),active:true}).first():null;
  if(b.discountCode&&!discount) throw httpError(400,'Discount unavailable.');
  const quotation=b.quotationId ? await db('quotations').where({id:b.quotationId,status:'Confirmed',customer_id:b.customerId,plan_id:b.planId}).first():null;
  if(b.quotationId&&!quotation) throw httpError(400,'Confirmed quotation not found for this customer and plan.');
  if(quotation&&quotation.seats!==b.quantity) throw httpError(400,'Quantity must match the confirmed quotation.');
  if(quotation&&quotation.valid_until&&date(quotation.valid_until)<currentDay) throw httpError(400,'Quotation has expired.');
  if(quotation&&quotation.discount_code&&quotation.discount_code.toUpperCase()!==b.discountCode?.toUpperCase()) throw httpError(400,'Discount must match the confirmed quotation.');
  if(quotation&&b.interval!=='monthly') throw httpError(400,'This quotation specifies monthly pricing.');
  const unit=quotation?quotation.unit_cents:plan[`${b.interval}_cents`]; if(unit===null||unit===undefined) throw httpError(400,'That billing interval is not available for this plan.');
  const quoteLines=quotation?await db('quotation_lines').where({quotation_id:quotation.id}):[];
  const amount=unit*b.quantity+quoteLines.reduce((sum,l)=>sum+Number(l.total_cents),0);
  if(discount&&!discountEligible(discount,{planId:plan.id,amountCents:amount,quantity:b.quantity,productLines:quoteLines})) throw httpError(400,'Discount is expired, exhausted, or ineligible.');
  if(b.expiresOn&&b.expiresOn<currentDay) throw httpError(400,'Expiry date must not be in the past.');
  const expiresOn=b.expiresOn || (plan.auto_close&&plan.available_until?date(plan.available_until):null);
  const subId=id(); const today=new Date();
  await db.transaction(async trx => { if(quotation&&!await trx('quotations').where({id:quotation.id,status:'Confirmed'}).forUpdate().first()) throw httpError(409,'Quotation was already used or changed.'); await trx('subscriptions').insert({id:subId,number:`SUB-${subId.slice(0,8).toUpperCase()}`,customer_id:customer.id,plan_id:plan.id,discount_id:discount?.id||null,interval:b.interval,status:'Active',quantity:b.quantity,amount_cents:amount,started_at:today,next_billing_at:today,expires_on:expiresOn,payment_terms_days:b.paymentTermsDays,auto_renew:!!plan.auto_renew}); if(quoteLines.length) await trx('subscription_lines').insert(quoteLines.map(l=>({id:id(),subscription_id:subId,product_id:l.product_id,variant_id:l.variant_id,description:l.description,quantity:l.quantity,unit_cents:l.unit_cents,tax_basis_points:l.tax_basis_points,total_cents:l.total_cents}))); if(quotation) await trx('quotations').where({id:quotation.id,status:'Confirmed'}).update({status:'Active',updated_at:new Date()}); await audit(trx,req.user.id,'subscription.create','subscription',subId); });
  res.status(201).json({id:subId});
}));
admin.post('/billing/run', asyncRoute(async (req,res) => res.json(await generateDueInvoices(req.user.id))));
admin.post('/subscriptions/:id/renew',asyncRoute(async(req,res)=>{
  const b=parse(z.object({expiresOn:z.iso.date().optional()}),req.body);
  await db.transaction(async trx=>{
    const sub=await trx('subscriptions').where({id:req.params.id}).forUpdate().first(); if(!sub||!['Active','Closed'].includes(sub.status)||sub.next_billing_at) throw httpError(409,'Subscription is not awaiting renewal.');
    const next=date(new Date()); if(b.expiresOn&&b.expiresOn<next) throw httpError(400,'Expiry must not be in the past.');
    await trx('subscriptions').where({id:sub.id}).update({status:'Active',next_billing_at:next,expires_on:b.expiresOn||null,ended_at:null,auto_renew:true,updated_at:new Date()});
    await audit(trx,req.user.id,'subscription.renew','subscription',sub.id,{expiresOn:b.expiresOn||null});
  });res.json({ok:true});
}));
admin.post('/quotations/:id/advance', asyncRoute(async (req,res) => {
  const quote=await db('quotations').where({id:req.params.id}).first(); if(!quote) throw httpError(404,'Quotation not found.');
  if(quote.valid_until&&date(quote.valid_until)<date(new Date())) throw httpError(409,'Quotation expired.');
  const next={Draft:'Quotation',Quotation:'Confirmed'}[quote.status]; if(!next) throw httpError(409,'Quotation cannot advance from this status.');
  await db.transaction(async trx => { await trx('quotations').where({id:quote.id,status:quote.status}).update({status:next,updated_at:new Date()}); await audit(trx,req.user.id,'quotation.advance','quotation',quote.id,{status:next}); });
  res.json({status:next});
}));
admin.post('/coupons', asyncRoute(async (req,res) => {
  const b=parse(z.object({code:z.string().trim().min(2).max(60),kind:z.enum(['fixed','percent']),value:z.number().positive(),minimum:z.number().nonnegative().default(0),minimumQuantity:z.number().int().min(1).default(1),scope:z.enum(['subscription','product']).default('subscription'),planId:z.string().uuid().optional(),productId:z.string().uuid().optional(),startsAt:z.iso.date().optional(),endsAt:z.iso.date().optional(),usageLimit:z.number().int().positive().optional()}),req.body);
  if(b.kind==='percent'&&b.value>100) throw httpError(400,'Percentage cannot exceed 100.');
  if(b.startsAt&&b.endsAt&&b.startsAt>b.endsAt) throw httpError(400,'Discount end date must follow start date.');
  if(b.planId&&!await db('plans').where({id:b.planId}).first()) throw httpError(400,'Plan not found.');
  if(b.scope==='product'&&!b.productId) throw httpError(400,'A product discount needs a product ID.');
  if(b.scope==='subscription'&&b.productId) throw httpError(400,'Product ID is only valid for product discounts.');
  if(b.scope==='product') {
    const product=await db('products').where({id:b.productId,active:true}).first(); if(!product) throw httpError(400,'Product unavailable.');
    const variants=await db('product_variants').where({product_id:product.id});
    const minUnit=product.sales_price_cents+Math.min(0,...variants.map(v=>Number(v.price_delta_cents)));
    if(minUnit<=0) throw httpError(400,'Product variant price must be positive.');
    const base=minUnit*b.minimumQuantity;
    const reduction=b.kind==='percent'?Math.round(base*b.value/100):Math.min(base,cents(b.value));
    const marginPercent=Number(process.env.MIN_MARGIN_PERCENT||0);
    if(!Number.isFinite(marginPercent)||marginPercent<0||marginPercent>=100) throw new Error('MIN_MARGIN_PERCENT must be between 0 and 99.99.');
    const required=Math.ceil(product.cost_cents*b.minimumQuantity/(1-marginPercent/100));
    if(base-reduction<required) throw httpError(409,`Discount would reduce the worst-case product margin below ${marginPercent}%.`);
  }
  const discountId=id();await db('discounts').insert({id:discountId,code:b.code.toUpperCase(),kind:b.kind,value:b.kind==='fixed'?cents(b.value):b.value,minimum_cents:cents(b.minimum),minimum_quantity:b.minimumQuantity,scope:b.scope,plan_id:b.planId||null,product_id:b.productId||null,starts_at:b.startsAt||null,ends_at:b.endsAt||null,usage_limit:b.usageLimit||null});
  res.status(201).json({id:discountId});
}));
admin.post('/invoices/:id/confirm', asyncRoute(async (req,res) => { const count=await db('invoices').where({id:req.params.id,status:'Draft'}).update({status:'Confirmed',updated_at:new Date()}); if(!count) throw httpError(409,'Only draft invoices can be confirmed.'); res.json({ok:true}); }));
admin.post('/invoices/:id/cancel', asyncRoute(async (req,res) => { await db.transaction(async trx => { const invoice=await trx('invoices').where({id:req.params.id}).forUpdate().first(); if(!invoice||!['Draft','Confirmed'].includes(invoice.status)) throw httpError(409,'Invoice cannot be cancelled.'); if(await trx('payments').where({invoice_id:invoice.id,status:'Successful'}).first()) throw httpError(409,'Refund or reverse recorded payments before cancellation.'); if(await trx('invoice_orders').where({invoice_id:invoice.id}).first()) throw httpError(409,'A Razorpay order exists. Verify its outcome before cancelling.'); await trx('invoices').where({id:invoice.id}).update({status:'Cancelled',updated_at:new Date()}); await audit(trx,req.user.id,'invoice.cancel','invoice',invoice.id); }); res.json({ok:true}); }));
admin.post('/invoices/:id/send', asyncRoute(async (req,res) => {
  if(!process.env.SMTP_HOST||!process.env.SMTP_FROM||!publicOrigin()) throw httpError(503,'Invoice email is not configured.');
  const invoice=await db('invoices').where({id:req.params.id}).whereIn('status',['Confirmed','Paid']).first();
  if(!invoice) throw httpError(409,'Only confirmed invoices can be sent.');
  const customer=await db('users').where({id:invoice.customer_id}).first();
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined});
  await transport.sendMail({from:process.env.SMTP_FROM,to:customer.email,subject:`Invoice ${invoice.number}`,text:`Your invoice ${invoice.number} for INR ${money(invoice.total_cents).toFixed(2)} is available. Due: ${date(invoice.due_date)}. Sign in at ${publicOrigin()}/customer/invoices to review and download it.`});
  await db.transaction(async trx=>{await trx('invoices').where({id:invoice.id}).update({sent_at:new Date(),updated_at:new Date()});await audit(trx,req.user.id,'invoice.send','invoice',invoice.id);});
  res.json({ok:true});
}));
admin.get('/invoices/:id/pdf',asyncRoute(async(req,res)=>{
  const invoice=await db('invoices').where({id:req.params.id}).first(); if(!invoice) throw httpError(404,'Invoice not found.');
  const [customer,lines]=await Promise.all([db('users').where({id:invoice.customer_id}).first(),db('invoice_lines').where({invoice_id:invoice.id})]);
  res.setHeader('Content-Type','application/pdf'); res.setHeader('Content-Disposition',`inline; filename="invoice-${invoice.number}.pdf"`);
  const pdf=new PDFDocument({margin:50}); pdf.pipe(res);
  pdf.fontSize(24).text('Invoice').moveDown().fontSize(11).text(`Reference: ${invoice.number}`).text(`Customer: ${customer.name} (${customer.email})`).text(`Due: ${date(invoice.due_date)}`).text(`Status: ${invoice.status}`);
  pdf.moveDown(); for(const line of lines) pdf.text(`${line.description} x ${line.quantity}: INR ${money(line.total_cents).toFixed(2)}`);
  pdf.moveDown().text(`Subtotal: INR ${money(invoice.subtotal_cents).toFixed(2)}`).text(`Discount: -INR ${money(invoice.discount_cents).toFixed(2)}`).text(`Tax: INR ${money(invoice.tax_cents).toFixed(2)}`).fontSize(15).text(`Total: INR ${money(invoice.total_cents).toFixed(2)}`);
  pdf.end();
}));
admin.post('/payments', asyncRoute(async (req,res) => {
  const b=parse(z.object({ invoiceId:z.string().uuid(), amount:z.number().positive(), method:z.string().trim().min(2).max(100), note:z.string().max(2000).default(''), externalReference:z.string().max(120).optional(),paidAt:z.iso.date().optional() }),req.body);
  const invoice=await db('invoices').where({id:b.invoiceId}).first(); if(!invoice||!['Confirmed','Paid'].includes(invoice.status)) throw httpError(400,'Confirmed invoice not found.');
  const paymentId=id(); await db.transaction(async trx => { const current=await trx('invoices').where({id:invoice.id}).forUpdate().first(); if(!current||!['Confirmed','Paid'].includes(current.status)) throw httpError(409,'Invoice status changed.'); const paid=await trx('payments').where({invoice_id:invoice.id,status:'Successful'}).sum({amount:'amount_cents'}).first(); if(Number(paid.amount||0)+cents(b.amount)>current.total_cents) throw httpError(400,'Payment exceeds invoice balance.'); await trx('payments').insert({id:paymentId,invoice_id:invoice.id,customer_id:invoice.customer_id,amount_cents:cents(b.amount),method:b.method,status:'Successful',external_reference:b.externalReference||null,note:b.note,paid_at:b.paidAt?new Date(`${b.paidAt}T12:00:00Z`):new Date()}); if(Number(paid.amount||0)+cents(b.amount)===current.total_cents) await trx('invoices').where({id:invoice.id}).update({status:'Paid',updated_at:new Date()}); await audit(trx,req.user.id,'payment.record','invoice',invoice.id,{paymentId,amount:b.amount,paidAt:b.paidAt||date(new Date())}); }); res.status(201).json({id:paymentId});
}));
admin.post('/payment-exceptions',asyncRoute(async(req,res)=>{
  const b=parse(z.object({invoiceId:z.string().uuid(),amount:z.number().positive(),method:z.string().trim().min(2).max(100),externalReference:z.string().trim().min(3).max(120),status:z.enum(['Failed','Unknown','Pending']),note:z.string().max(2000).default('')}),req.body);
  const invoice=await db('invoices').where({id:b.invoiceId,status:'Confirmed'}).first(); if(!invoice) throw httpError(409,'Confirmed invoice not found.');
  const paymentId=id(); await db.transaction(async trx=>{await trx('payments').insert({id:paymentId,invoice_id:invoice.id,customer_id:invoice.customer_id,amount_cents:cents(b.amount),method:b.method,status:b.status,external_reference:b.externalReference,note:b.note,paid_at:new Date()});await audit(trx,req.user.id,'payment.exception','payment',paymentId,{status:b.status});});
  res.status(201).json({id:paymentId});
}));
admin.post('/payment-exceptions/:id/verify',asyncRoute(async(req,res)=>{
  const b=parse(z.object({outcome:z.enum(['Successful','Failed']),note:z.string().trim().min(10).max(2000)}),req.body);
  await db.transaction(async trx=>{
    const payment=await trx('payments').where({id:req.params.id}).forUpdate().first(); if(!payment||!['Unknown','Pending'].includes(payment.status)) throw httpError(409,'Unresolved payment not found.');
    const invoice=await trx('invoices').where({id:payment.invoice_id}).forUpdate().first();
    if(b.outcome==='Successful') { if(!invoice||!['Confirmed','Paid'].includes(invoice.status)) throw httpError(409,'Invoice is not payable.'); const paid=await trx('payments').where({invoice_id:invoice.id,status:'Successful'}).sum({amount:'amount_cents'}).first(); if(Number(paid.amount||0)+payment.amount_cents>invoice.total_cents) throw httpError(409,'Verified amount exceeds the invoice balance.'); if(Number(paid.amount||0)+payment.amount_cents===invoice.total_cents) await trx('invoices').where({id:invoice.id}).update({status:'Paid',updated_at:new Date()}); }
    await trx('payments').where({id:payment.id}).update({status:b.outcome,note:`${payment.note||''}\nVerification: ${b.note}`,updated_at:new Date()});
    await audit(trx,req.user.id,'payment.verify','payment',payment.id,{outcome:b.outcome,note:b.note});
  });res.json({ok:true});
}));
