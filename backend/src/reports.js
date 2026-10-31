import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { asyncRoute, date, httpError, money, parse } from './lib.js';

export const reports = Router();

reports.get('/', asyncRoute(async (req, res) => {
  const filters=parse(z.object({
    from:z.iso.date().optional(), to:z.iso.date().optional(),
    customerId:z.string().uuid().optional(), planId:z.string().uuid().optional(),
  }),req.query);
  if(filters.from&&filters.to&&filters.from>filters.to) throw httpError(400,'Start date must be before end date.');
  const subscriptions=db('subscriptions as s').where('s.status','Active');
  const invoices=db('invoices as i').leftJoin('subscriptions as s','s.id','i.subscription_id');
  const payments=db('payments as p').join('invoices as i','i.id','p.invoice_id').leftJoin('subscriptions as s','s.id','i.subscription_id').where('p.status','Successful');
  if(filters.customerId) { subscriptions.where('s.customer_id',filters.customerId); invoices.where('i.customer_id',filters.customerId); payments.where('p.customer_id',filters.customerId); }
  if(filters.planId) { subscriptions.where('s.plan_id',filters.planId); invoices.where('s.plan_id',filters.planId); payments.where('s.plan_id',filters.planId); }
  if(filters.from) { invoices.where('i.created_at','>=',`${filters.from} 00:00:00`); payments.where('p.paid_at','>=',`${filters.from} 00:00:00`); }
  if(filters.to) { const end=new Date(Date.parse(`${filters.to}T00:00:00Z`)+86400000).toISOString().slice(0,19).replace('T',' '); invoices.where('i.created_at','<',end); payments.where('p.paid_at','<',end); }
  const [active, invoiced, collected, overdue]=await Promise.all([
    subscriptions.count({count:'s.id'}).first(),
    invoices.clone().count({count:'i.id'}).sum({cents:'i.total_cents'}).first(),
    payments.count({count:'p.id'}).sum({cents:'p.amount_cents'}).first(),
    invoices.clone().where('i.status','Confirmed').where('i.due_date','<',date(new Date())).count({count:'i.id'}).first(),
  ]);
  res.json({ filters, activeSubscriptions:Number(active.count||0), invoiceCount:Number(invoiced.count||0), invoicedAmount:money(invoiced.cents), paymentCount:Number(collected.count||0), collectedAmount:money(collected.cents), overdueInvoices:Number(overdue.count||0) });
}));
