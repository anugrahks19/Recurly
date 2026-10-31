import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { asyncRoute, date, httpError, id, money, parse, requireRole, audit } from './lib.js';
import PDFDocument from 'pdfkit';

export const customer = Router();
customer.use(requireRole('user'));
const planView = p => ({ id: p.id, name: p.name, description: p.description || '', daily: p.daily_cents===null?null:money(p.daily_cents), weekly: p.weekly_cents===null?null:money(p.weekly_cents), monthly: money(p.monthly_cents), annual: money(p.annual_cents), trialDays: p.trial_days, features: JSON.parse(p.features_json || '[]') });
customer.get('/portal', asyncRoute(async (req, res) => {
  const userId = req.user.id;
  const [plans, subscriptions, invoices, payments, notifications, cases, replies] = await Promise.all([
    db('plans').where({ active: true }).orderBy('monthly_cents'), db('subscriptions').where({ customer_id: userId }).orderBy('created_at','desc'),
    db('invoices').where({ customer_id: userId }).orderBy('created_at','desc'), db('payments').where({ customer_id: userId }).orderBy('paid_at','desc'),
    db('notifications').where({ user_id: userId }).orderBy('created_at','desc').limit(100), db('support_cases').where({ customer_id: userId }).orderBy('created_at','desc'),
    db('support_replies').join('support_cases', 'support_replies.case_id', 'support_cases.id').where('support_cases.customer_id', userId).select('support_replies.*'),
  ]);
  res.json({
    profile: { name: req.user.name, email: req.user.email, phone: req.user.phone || '', company: req.user.company || '', notifications: { email: !!req.user.notify_email, renewal: !!req.user.notify_renewal, product: !!req.user.notify_product } },
    plans: plans.map(planView),
    subscriptions: subscriptions.map(s => ({ id: s.id, planId: s.plan_id, status: s.status, interval: s.interval, amount: money(s.amount_cents), startedAt: date(s.started_at), nextBillingAt: s.next_billing_at ? date(s.next_billing_at) : null, endedAt: s.ended_at ? date(s.ended_at) : null, history: [] })),
    invoices: invoices.map(i => ({ id: i.id, date: date(i.created_at), dueDate: date(i.due_date), amount: money(i.total_cents), status: i.status, description: 'Subscription invoice', receiptAvailable: i.status === 'Paid' })),
    payments: payments.map(p => ({ id: p.id, date: date(p.paid_at), amount: money(p.amount_cents), status: p.status, method: p.method, invoiceId: p.invoice_id })),
    paymentMethods: [],
    notifications: notifications.map(n => ({ id: n.id, type: n.type, title: n.title, detail: n.detail || '', date: date(n.created_at), read: !!n.read_at })),
    support: cases.map(c => ({ id: c.id, category: c.category, subject: c.subject, description: c.description, status: c.status, date: date(c.created_at), replies: replies.filter(r => r.case_id === c.id).map(r => ({ from: r.author_id === userId ? 'You' : 'Support', date: date(r.created_at), text: r.body })) })),
    coupons: [],
  });
}));
customer.post('/coupons/validate', asyncRoute(async (req, res) => {
  const { code, planId } = parse(z.object({ code: z.string().trim().min(1), planId: z.string(), interval: z.string().optional() }), req.body);
  const d = await db('discounts').where({ code: code.toUpperCase(), active: true }).first();
  if (!d || (d.plan_id && d.plan_id !== planId) || (d.starts_at && new Date(d.starts_at) > new Date()) || (d.ends_at && new Date(d.ends_at) < new Date()) || (d.usage_limit !== null && d.times_used >= d.usage_limit)) throw httpError(400, 'This code is invalid, expired, or not eligible for this plan.');
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
  const status = { pause: 'Paused', resume: 'Active', cancel: 'Closed' }[req.params.action];
  if ((req.params.action === 'pause' && sub.status !== 'Active') || (req.params.action === 'resume' && sub.status !== 'Paused') || (req.params.action === 'cancel' && !['Active','Paused'].includes(sub.status))) throw httpError(409, 'This subscription cannot be changed in its current state.');
  await db.transaction(async trx => { await trx('subscriptions').where({ id: sub.id }).update({ status, auto_renew: status === 'Active', ended_at: status === 'Closed' ? new Date() : null, updated_at: new Date() }); await audit(trx, req.user.id, `subscription.${req.params.action}`, 'subscription', sub.id); });
  res.json({ status });
}));
customer.post('/checkout/quote', (_req, res) => res.status(503).json({ message: 'Checkout requires a configured payment provider. No charge or subscription was created.' }));
customer.post('/checkout/confirm', (_req, res) => res.status(503).json({ message: 'Checkout requires a configured payment provider. No charge or subscription was created.' }));
customer.post('/payment-methods/setup', (_req, res) => res.status(503).json({ message: 'Payment provider is not configured.' }));
customer.post('/payment-methods/:id/update', (_req, res) => res.status(503).json({ message: 'Payment provider is not configured.' }));
customer.post('/payment-methods/:id/default', (_req, res) => res.status(503).json({ message: 'Payment provider is not configured.' }));
customer.delete('/payment-methods/:id', (_req, res) => res.status(503).json({ message: 'Payment provider is not configured.' }));
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
  pdf.moveDown(); for(const line of lines) pdf.text(`${line.description}  × ${line.quantity}  $${money(line.total_cents).toFixed(2)}`);
  pdf.moveDown().text(`Subtotal: $${money(invoice.subtotal_cents).toFixed(2)}`).text(`Discount: -$${money(invoice.discount_cents).toFixed(2)}`).text(`Tax: $${money(invoice.tax_cents).toFixed(2)}`).fontSize(15).text(`Total: $${money(invoice.total_cents).toFixed(2)}`);
  pdf.end();
}));
