import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { asyncRoute, date, httpError, id, money, parse, requireRole, audit } from './lib.js';
import PDFDocument from 'pdfkit';
import { discountEligible, discountAmount } from './discounts.js';
import { razorpayConfigured, razorpayApi, verifyCheckoutSignature, fulfillCapturedPayment, fulfillInvoicePayment } from './razorpay.js';

export const customer = Router();
customer.use(requireRole('user'));
const planView = p => ({ id: p.id, name: p.name, description: p.description || '', daily: p.daily_cents===null?null:money(p.daily_cents), weekly: p.weekly_cents===null?null:money(p.weekly_cents), monthly: money(p.monthly_cents), annual: money(p.annual_cents), minimumQuantity:p.minimum_quantity, trialDays: p.trial_days, features: JSON.parse(p.features_json || '[]') });
customer.get('/portal', asyncRoute(async (req, res) => {
  const userId = req.user.id;
  const [plans, subscriptions, invoices, payments, notifications, cases, replies] = await Promise.all([
    db('plans').where({ active: true }).where(q=>q.whereNull('available_from').orWhere('available_from','<=',new Date())).where(q=>q.whereNull('available_until').orWhere('available_until','>=',new Date())).orderBy('monthly_cents'), db('subscriptions').where({ customer_id: userId }).orderBy('created_at','desc'),
    db('invoices').where({ customer_id: userId }).orderBy('created_at','desc'), db('payments').where({ customer_id: userId }).orderBy('paid_at','desc'),
    db('notifications').where({ user_id: userId }).orderBy('created_at','desc').limit(100), db('support_cases').where({ customer_id: userId }).orderBy('created_at','desc'),
    db('support_replies').join('support_cases', 'support_replies.case_id', 'support_cases.id').where('support_cases.customer_id', userId).select('support_replies.*'),
  ]);
  res.json({
    profile: { name: req.user.name, email: req.user.email, phone: req.user.phone || '', company: req.user.company || '', notifications: { email: !!req.user.notify_email, renewal: !!req.user.notify_renewal, product: !!req.user.notify_product } },
    plans: plans.map(planView),
    subscriptions: subscriptions.map(s => ({ id: s.id, planId: s.plan_id, status: s.status, interval: s.interval, quantity:s.quantity, amount: money(s.amount_cents), startedAt: date(s.started_at), nextBillingAt: s.next_billing_at ? date(s.next_billing_at) : null, endedAt: s.ended_at ? date(s.ended_at) : null, history: [] })),
    invoices: invoices.map(i => ({ id: i.id, date: date(i.created_at), dueDate: date(i.due_date), amount: money(i.total_cents), status: i.status, description: 'Subscription invoice', receiptAvailable: i.status === 'Paid' })),
    payments: payments.map(p => ({ id: p.id, date: date(p.paid_at), amount: money(p.amount_cents), status: p.status, method: p.method, invoiceId: p.invoice_id })),
    paymentMethods: [],
    notifications: notifications.map(n => ({ id: n.id, type: n.type, title: n.title, detail: n.detail || '', date: date(n.created_at), read: !!n.read_at })),
    support: cases.map(c => ({ id: c.id, category: c.category, subject: c.subject, description: c.description, status: c.status, date: date(c.created_at), replies: replies.filter(r => r.case_id === c.id).map(r => ({ from: r.author_id === userId ? 'You' : 'Support', date: date(r.created_at), text: r.body })) })),
    coupons: [],
  });
}));
customer.post('/coupons/validate', asyncRoute(async (req, res) => {
  const { code, planId, interval, quantity } = parse(z.object({ code: z.string().trim().min(1), planId: z.string(), interval: z.enum(['daily','weekly','monthly','annual']),quantity:z.number().int().min(1).max(10000).default(1) }), req.body);
  const d = await db('discounts').where({ code: code.toUpperCase(), active: true }).first();
  const plan=await db('plans').where({id:planId,active:true}).first();
  if (!plan || !discountEligible(d,{planId,amountCents:(plan[`${interval}_cents`]||0)*quantity,quantity})) throw httpError(400, 'This code is invalid, expired, or not eligible for this plan.');
  res.json({ code: d.code, kind: d.kind, value: d.kind === 'fixed' ? money(d.value) : d.value, expiresAt: d.ends_at ? date(d.ends_at) : 'No expiry', eligiblePlans: d.plan_id ? [d.plan_id] : [planId] });
}));
customer.patch('/profile', asyncRoute(async (req, res) => {
  const body = parse(z.object({ name: z.string().trim().min(2).max(160), email: z.email().max(254), phone: z.string().max(40).optional(), company: z.string().max(160).optional(), notifications: z.object({ email: z.boolean(), renewal: z.boolean(), product: z.boolean() }).optional() }), req.body);
  const email = body.email.trim().toLowerCase();
  if (email !== req.user.email && await db('users').where({ email }).first()) throw httpError(409, 'Email already registered.');
  await db('users').where({ id: req.user.id }).update({ name: body.name, email, phone: body.phone || '', company: body.company || '', notify_email: body.notifications?.email ?? true, notify_renewal: body.notifications?.renewal ?? true, notify_product: body.notifications?.product ?? false, updated_at: new Date() });
  res.json({ message: 'Profile saved.' });
}));
customer.post('/notifications/:id/read', asyncRoute(async (req, res) => { const count = await db('notifications').where({ id: req.params.id, user_id: req.user.id }).update({ read_at: new Date() }); if (!count) throw httpError(404, 'Notification not found.'); res.json({ ok: true }); }));
customer.post('/support', asyncRoute(async (req, res) => {
  const body = parse(z.object({ category: z.string().min(1).max(40), subject: z.string().trim().min(3).max(200), description: z.string().trim().min(3).max(5000) }), req.body);
  const caseId = id(); await db('support_cases').insert({ id: caseId, customer_id: req.user.id, ...body }); res.status(201).json({ id: caseId });
}));
customer.post('/support/:id/replies', asyncRoute(async (req, res) => {
  const { text } = parse(z.object({ text: z.string().trim().min(1).max(5000) }), req.body);
  const supportCase = await db('support_cases').where({ id: req.params.id, customer_id: req.user.id }).first(); if (!supportCase) throw httpError(404, 'Case not found.');
  await db('support_replies').insert({ id: id(), case_id: supportCase.id, author_id: req.user.id, body: text }); res.status(201).json({ ok: true });
}));
customer.post('/subscriptions/:id/preview-change', (_req, res) => res.status(503).json({ message: 'Plan changes require a configured payment provider.' }));
customer.post('/subscriptions/:id/:action', asyncRoute(async (req, res) => {
  if (!['pause','resume','cancel'].includes(req.params.action)) throw httpError(404, 'Action unavailable.');
  const sub = await db('subscriptions').where({ id: req.params.id, customer_id: req.user.id }).first(); if (!sub) throw httpError(404, 'Subscription not found.');
  const plan=await db('plans').where({id:sub.plan_id}).first();
  if(req.params.action==='pause'&&!plan?.can_pause) throw httpError(409,'This plan cannot be paused.');
  const status = { pause: 'Paused', resume: 'Active', cancel: 'Closed' }[req.params.action];
  if ((req.params.action === 'pause' && sub.status !== 'Active') || (req.params.action === 'resume' && sub.status !== 'Paused') || (req.params.action === 'cancel' && !['Active','Paused'].includes(sub.status))) throw httpError(409, 'This subscription cannot be changed in its current state.');
  await db.transaction(async trx => { await trx('subscriptions').where({ id: sub.id }).update({ status, auto_renew: status === 'Active' && !!plan.auto_renew, ended_at: status === 'Closed' ? new Date() : null, updated_at: new Date() }); await audit(trx, req.user.id, `subscription.${req.params.action}`, 'subscription', sub.id); });
  res.json({ status });
}));
customer.post('/checkout/quote',asyncRoute(async(req,res)=>{
  if(!razorpayConfigured()) throw httpError(503,'Razorpay checkout is not configured.');
  const b=parse(z.object({planId:z.string().uuid(),interval:z.enum(['daily','weekly','monthly','annual']),quantity:z.number().int().min(1).max(10000).default(1),couponCode:z.string().max(60).nullish(),paymentMethodId:z.string().nullish()}),req.body);
  const plan=await db('plans').where({id:b.planId,active:true}).first();
  const today=date(new Date());
  if(!plan||(plan.available_from&&date(plan.available_from)>today)||(plan.available_until&&date(plan.available_until)<today)) throw httpError(400,'Plan unavailable.');
  if(b.quantity<plan.minimum_quantity) throw httpError(400,`Minimum quantity is ${plan.minimum_quantity}.`);
  const unit=plan[`${b.interval}_cents`];if(unit===null||unit===undefined) throw httpError(400,'Billing interval unavailable.');
  const subtotal=unit*b.quantity;
  const discount=b.couponCode?await db('discounts').where({code:b.couponCode.toUpperCase(),active:true}).first():null;
  if(b.couponCode&&!discountEligible(discount,{planId:plan.id,amountCents:subtotal,quantity:b.quantity})) throw httpError(400,'Coupon is expired or ineligible.');
  const discountCents=discount?discountAmount(discount,subtotal):0;
  const tax=await db('tax_rules').where({active:true}).first();
  const taxCents=Math.round((subtotal-discountCents)*(tax?.rate_basis_points||0)/10000);
  const total=subtotal-discountCents+taxCents;
  if(total<100) throw httpError(400,'Razorpay requires a first charge of at least INR 1.');
  const quoteId=id();await db('checkout_quotes').insert({id:quoteId,customer_id:req.user.id,plan_id:plan.id,interval:b.interval,quantity:b.quantity,discount_id:discount?.id||null,subtotal_cents:subtotal,discount_cents:discountCents,tax_cents:taxCents,total_cents:total,expires_at:new Date(Date.now()+15*60000)});
  res.status(201).json({id:quoteId,subtotal:money(subtotal),discount:money(discountCents),tax:money(taxCents),total:money(total),currency:'INR'});
}));
customer.post('/checkout/confirm',asyncRoute(async(req,res)=>{
  if(!razorpayConfigured()) throw httpError(503,'Razorpay checkout is not configured.');
  const {quoteId}=parse(z.object({quoteId:z.string().uuid(),paymentMethodId:z.string().nullish()}),req.body);
  const result=await db.transaction(async trx=>{
    const quote=await trx('checkout_quotes').where({id:quoteId,customer_id:req.user.id}).forUpdate().first();
    if(!quote||quote.used_at||new Date(quote.expires_at)<new Date()) throw httpError(409,'Quote expired or already used. Review the price again.');
    if(quote.razorpay_order_id) return {orderId:quote.razorpay_order_id,amount:quote.total_cents};
    const order=await razorpayApi('/orders',{method:'POST',body:{amount:quote.total_cents,currency:'INR',receipt:quote.id,notes:{customer_id:req.user.id,plan_id:quote.plan_id}}});
    if(!order.id||order.amount!==quote.total_cents||order.currency!=='INR') throw httpError(502,'Payment provider returned an unexpected order.');
    await trx('checkout_quotes').where({id:quote.id}).update({razorpay_order_id:order.id});
    return {orderId:order.id,amount:order.amount};
  });
  res.json({...result,keyId:process.env.RAZORPAY_KEY_ID,currency:'INR',name:'Recurly'});
}));
customer.post('/checkout/verify',asyncRoute(async(req,res)=>{
  const b=parse(z.object({orderId:z.string().min(5).max(80),paymentId:z.string().min(5).max(80),signature:z.string().length(64)}),req.body);
  const quote=await db('checkout_quotes').where({razorpay_order_id:b.orderId,customer_id:req.user.id}).first();
  if(!quote||!verifyCheckoutSignature(quote.razorpay_order_id,b.paymentId,b.signature)) throw httpError(400,'Payment signature invalid.');
  const payment=await razorpayApi(`/payments/${encodeURIComponent(b.paymentId)}`);
  if(payment.id!==b.paymentId||payment.order_id!==quote.razorpay_order_id) throw httpError(409,'Payment does not belong to this order.');
  if(payment.status!=='captured') return res.json({status:'pending',message:'Payment is awaiting capture. Your subscription will appear after provider confirmation.'});
  const result=await fulfillCapturedPayment(payment);
  res.json({...result,message:'Payment captured and subscription activated.'});
}));
customer.post('/payment-methods/setup', (_req, res) => res.status(503).json({ message: 'Payment provider is not configured.' }));
customer.post('/payment-methods/:id/update', (_req, res) => res.status(503).json({ message: 'Payment provider is not configured.' }));
customer.post('/payment-methods/:id/default', (_req, res) => res.status(503).json({ message: 'Payment provider is not configured.' }));
customer.delete('/payment-methods/:id', (_req, res) => res.status(503).json({ message: 'Payment provider is not configured.' }));
customer.post('/invoices/:id/order',asyncRoute(async(req,res)=>{
  if(!razorpayConfigured()) throw httpError(503,'Razorpay checkout is not configured.');
  const result=await db.transaction(async trx=>{
    const invoice=await trx('invoices').where({id:req.params.id,customer_id:req.user.id}).forUpdate().first();
    if(!invoice||invoice.status!=='Confirmed'||invoice.total_cents<100) throw httpError(409,'Invoice is not payable through Razorpay.');
    if(await trx('payments').where({invoice_id:invoice.id,status:'Successful'}).first()) throw httpError(409,'Partially paid invoices require staff review.');
    const existing=await trx('invoice_orders').where({invoice_id:invoice.id}).first();
    if(existing) return {orderId:existing.razorpay_order_id,amount:existing.amount_cents};
    const order=await razorpayApi('/orders',{method:'POST',body:{amount:invoice.total_cents,currency:'INR',receipt:invoice.id,notes:{customer_id:req.user.id,invoice_id:invoice.id}}});
    if(!order.id||order.amount!==invoice.total_cents||order.currency!=='INR') throw httpError(502,'Payment provider returned an unexpected order.');
    await trx('invoice_orders').insert({id:id(),invoice_id:invoice.id,customer_id:req.user.id,razorpay_order_id:order.id,amount_cents:order.amount});
    return {orderId:order.id,amount:order.amount};
  });res.json({...result,keyId:process.env.RAZORPAY_KEY_ID,currency:'INR',name:'Recurly'});
}));
customer.post('/invoices/:id/verify',asyncRoute(async(req,res)=>{
  const b=parse(z.object({orderId:z.string().min(5).max(80),paymentId:z.string().min(5).max(80),signature:z.string().length(64)}),req.body);
  const order=await db('invoice_orders').where({invoice_id:req.params.id,customer_id:req.user.id,razorpay_order_id:b.orderId}).first();
  if(!order||!verifyCheckoutSignature(order.razorpay_order_id,b.paymentId,b.signature)) throw httpError(400,'Payment signature invalid.');
  const payment=await razorpayApi(`/payments/${encodeURIComponent(b.paymentId)}`);
  if(payment.id!==b.paymentId||payment.order_id!==order.razorpay_order_id) throw httpError(409,'Payment does not belong to this order.');
  if(payment.status!=='captured') return res.json({status:'pending',message:'Payment is awaiting capture. The invoice will update after provider confirmation.'});
  res.json(await fulfillInvoicePayment(payment));
}));
customer.get('/invoices/:id/:kind', asyncRoute(async (req, res) => {
  if (!['invoice','receipt'].includes(req.params.kind)) throw httpError(404,'Document not found.');
  const invoice = await db('invoices').where({ id:req.params.id, customer_id:req.user.id }).first();
  if (!invoice) throw httpError(404,'Invoice not found.');
  if (req.params.kind === 'receipt' && invoice.status !== 'Paid') throw httpError(409,'Receipt is available after full payment.');
  const lines = await db('invoice_lines').where({invoice_id:invoice.id});
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition',`attachment; filename="${req.params.kind}-${invoice.number}.pdf"`);
  const pdf=new PDFDocument({margin:50}); pdf.pipe(res);
  pdf.fontSize(24).text(req.params.kind==='receipt'?'Payment receipt':'Invoice');
  pdf.moveDown().fontSize(11).text(`Reference: ${invoice.number}`).text(`Date: ${date(invoice.created_at)}`).text(`Due: ${date(invoice.due_date)}`).text(`Status: ${invoice.status}`).text(`Customer: ${req.user.name} (${req.user.email})`);
  pdf.moveDown(); for(const line of lines) pdf.text(`${line.description}  × ${line.quantity}  INR ${money(line.total_cents).toFixed(2)}`);
  pdf.moveDown().text(`Subtotal: INR ${money(invoice.subtotal_cents).toFixed(2)}`).text(`Discount: -INR ${money(invoice.discount_cents).toFixed(2)}`).text(`Tax: INR ${money(invoice.tax_cents).toFixed(2)}`).fontSize(15).text(`Total: INR ${money(invoice.total_cents).toFixed(2)}`);
  pdf.end();
}));
