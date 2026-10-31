import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { asyncRoute, date, httpError, id, money, parse, requireRole, cents, audit } from './lib.js';

export const staff = Router();
staff.use(requireRole('staff','admin'));
const customerView = (u, s, p) => ({ id: u.id, name: u.name, email: u.email, company: u.company || '', plan: p?.name || '', status: s?.status || 'No subscription', renewal: s?.next_billing_at ? date(s.next_billing_at) : '', notes: u.notes || '' });
staff.get('/workspace', asyncRoute(async (req, res) => {
  const [users, subscriptions, plans, discounts, cases, quotations, messages] = await Promise.all([
    db('users').where({ role: 'user' }).select('id','name','email','company','notes'), db('subscriptions').orderBy('created_at','desc'), db('plans'), db('discounts'), db('support_cases').orderBy('created_at','desc'), db('quotations').orderBy('created_at','desc'), db('admin_messages').where({ staff_id: req.user.id }).orderBy('created_at','desc'),
  ]);
  res.json({
    plans: plans.filter(p => p.active).map(p => ({ id:p.id, name:p.name, monthly:money(p.monthly_cents) })),
    customers: users.map(u => { const s = subscriptions.find(x => x.customer_id === u.id); return customerView(u, s, plans.find(p => p.id === s?.plan_id)); }),
    discounts: discounts.map(d => ({ id: d.id, code: d.code, type: d.kind === 'percent' ? 'Percentage' : 'Fixed', value: d.kind === 'fixed' ? money(d.value) : d.value, status: d.active && (!d.ends_at || new Date(d.ends_at) >= new Date()) ? 'Active' : 'Expired', expires: d.ends_at ? date(d.ends_at) : '9999-12-31' })),
    queries: cases.map(c => ({ id: c.id, customerId: c.customer_id, subject: c.subject, category: c.category, priority: c.priority, status: c.status, detail: c.description, createdAt: date(c.created_at) })),
    quotations: quotations.map(q => ({ id: q.id, customerId: q.customer_id, plan: plans.find(p => p.id === q.plan_id)?.name || '', seats: q.seats, unitPrice: money(q.unit_cents), discountCode: q.discount_code || '', status: q.status, note: q.note || '', createdAt: date(q.created_at) })),
    adminMessages: messages.map(m => ({ id: m.id, subject: m.subject, topic: m.topic, priority: m.priority, message: m.message, status: m.status, createdAt: date(m.created_at) })),
  });
}));
staff.post('/queries', asyncRoute(async (req, res) => {
  const body = parse(z.object({ customerId: z.string().uuid(), subject: z.string().trim().min(3).max(200), category: z.string().max(40), priority: z.enum(['Normal','High']), detail: z.string().trim().min(3).max(5000) }), req.body);
  if (!await db('users').where({ id: body.customerId, role: 'user' }).first()) throw httpError(404, 'Customer not found.');
  const caseId = id(); await db('support_cases').insert({ id: caseId, customer_id: body.customerId, subject: body.subject, category: body.category, priority: body.priority, description: body.detail }); res.status(201).json({ id: caseId });
}));
staff.patch('/queries/:id', asyncRoute(async (req, res) => { const { status } = parse(z.object({ status: z.enum(['Open','In Progress','Resolved']) }), req.body); const count = await db('support_cases').where({ id: req.params.id }).update({ status, updated_at: new Date() }); if (!count) throw httpError(404, 'Query not found.'); res.json({ ok: true }); }));
staff.post('/quotations', asyncRoute(async (req, res) => {
  const body = parse(z.object({ customerId: z.string().uuid(), plan: z.string(), seats: z.number().int().min(1).max(1000), discountCode: z.string().max(60).optional(), note: z.string().max(5000).optional() }), req.body);
  const [customer, plan] = await Promise.all([db('users').where({ id: body.customerId, role: 'user' }).first(), db('plans').where({ name: body.plan, active: true }).first()]);
  if (!customer || !plan) throw httpError(400, 'Customer or plan unavailable.');
  if (body.discountCode) { const discount = await db('discounts').where({ code: body.discountCode.toUpperCase(), active: true }).first(); if (!discount) throw httpError(400, 'Discount code unavailable.'); }
  const quotationId = id(); await db('quotations').insert({ id: quotationId, customer_id: customer.id, plan_id: plan.id, seats: body.seats, unit_cents: plan.monthly_cents, discount_code: body.discountCode || null, note: body.note || '', status: 'Draft' }); res.status(201).json({ id: quotationId });
}));
staff.post('/admin-messages', asyncRoute(async (req, res) => { const body = parse(z.object({ subject: z.string().trim().min(3).max(200), message: z.string().trim().min(3).max(5000), priority: z.enum(['Normal','High']), topic: z.string().max(100) }), req.body); const messageId = id(); await db('admin_messages').insert({ id: messageId, staff_id: req.user.id, subject: body.subject, topic:body.topic, priority:body.priority, message:body.message, status: 'Open' }); res.status(201).json({ id: messageId }); }));
staff.patch('/customers/:id', asyncRoute(async (req, res) => {
  const body = parse(z.object({ name: z.string().trim().min(2).max(160), email: z.email(), company: z.string().max(160), notes: z.string().max(5000) }), req.body);
  const user = await db('users').where({ id: req.params.id, role: 'user' }).first(); if (!user) throw httpError(404, 'Customer not found.');
  const email = body.email.toLowerCase(); if (email !== user.email && await db('users').where({ email }).first()) throw httpError(409, 'Email already registered.');
  await db.transaction(async trx => { await trx('users').where({ id: user.id }).update({ ...body, email, updated_at: new Date() }); await audit(trx, req.user.id, 'customer.update', 'user', user.id); }); res.json({ ok: true });
}));
staff.post('/customers', (_req, res) => res.status(409).json({ message: 'Customers create their own account through signup. Ask the customer to register first.' }));
