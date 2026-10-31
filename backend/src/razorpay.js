import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from './db.js';
import { audit, date, httpError, id } from './lib.js';
import { nextPeriod } from './period.js';

export function razorpayConfigured() { return !!(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET&&process.env.RAZORPAY_WEBHOOK_SECRET); }
export function verifyHmac(message, signature, secret) {
  if(!secret||typeof signature!=='string'||!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected=createHmac('sha256',secret).update(message).digest();
  return timingSafeEqual(expected,Buffer.from(signature,'hex'));
}
export function verifyCheckoutSignature(orderId,paymentId,signature) {
  return verifyHmac(`${orderId}|${paymentId}`,signature,process.env.RAZORPAY_KEY_SECRET);
}

export async function razorpayApi(path,{method='GET',body}={}) {
  if(!razorpayConfigured()) throw httpError(503,'Razorpay is not configured.');
  const response=await fetch(`https://api.razorpay.com/v1${path}`,{
    method,signal:AbortSignal.timeout(10000),
    headers:{Authorization:`Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,...(body?{'Content-Type':'application/json'}:{})},
    body:body?JSON.stringify(body):undefined,
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw httpError(502,'Payment provider request failed.');
  return data;
}

export async function fulfillCapturedPayment(payment,{eventId,eventType}={}) {
  if(payment.status!=='captured'||payment.currency!=='INR'||!payment.order_id||!payment.id||!Number.isInteger(payment.amount)) throw httpError(409,'Payment is not captured or does not match the order.');
  const result=await db.transaction(async trx=>{
    if(eventId&&await trx('razorpay_events').where({event_id:eventId}).first()) return {duplicate:true};
    const quote=await trx('checkout_quotes').where({razorpay_order_id:payment.order_id}).forUpdate().first();
    if(!quote) throw httpError(404,'Payment order not found.');
    if(Number(quote.total_cents)!==payment.amount) throw httpError(409,'Payment amount differs from the quoted order.');
    if(quote.used_at){if(quote.razorpay_payment_id!==payment.id) throw httpError(409,'Order was fulfilled by a different payment.');if(eventId) await trx('razorpay_events').insert({event_id:eventId,event_type:eventType||'payment.captured',payment_id:payment.id,processed_at:new Date()}).onConflict('event_id').ignore();return {subscriptionId:quote.subscription_id,status:'active',duplicate:true};}
    const plan=await trx('plans').where({id:quote.plan_id}).first();if(!plan) throw httpError(409,'Plan no longer exists.');
    const customer=await trx('users').where({id:quote.customer_id,role:'user'}).first();if(!customer) throw httpError(409,'Customer no longer exists.');
    const now=new Date();const periodStart=date(now);const periodEnd=nextPeriod(now,quote.interval);
    const subId=id(),invoiceId=id(),paymentRecordId=id();
    await trx('subscriptions').insert({id:subId,number:`SUB-${subId.slice(0,8).toUpperCase()}`,customer_id:quote.customer_id,plan_id:quote.plan_id,discount_id:quote.discount_id,interval:quote.interval,status:'Active',quantity:quote.quantity,amount_cents:quote.subtotal_cents,started_at:now,next_billing_at:plan.auto_renew?periodEnd:null,expires_on:plan.auto_close&&plan.available_until?date(plan.available_until):null,payment_terms_days:0,auto_renew:!!plan.auto_renew});
    await trx('invoices').insert({id:invoiceId,number:`INV-${invoiceId.slice(0,8).toUpperCase()}`,customer_id:quote.customer_id,subscription_id:subId,discount_id:quote.discount_id,period_start:periodStart,period_end:periodEnd,status:'Paid',subtotal_cents:quote.subtotal_cents,discount_cents:quote.discount_cents,tax_cents:quote.tax_cents,total_cents:quote.total_cents,due_date:periodStart});
    await trx('invoice_lines').insert({id:id(),invoice_id:invoiceId,description:`${plan.name} - ${quote.interval} subscription`,quantity:quote.quantity,unit_cents:Math.round(quote.subtotal_cents/quote.quantity),total_cents:quote.subtotal_cents});
    await trx('payments').insert({id:paymentRecordId,invoice_id:invoiceId,customer_id:quote.customer_id,amount_cents:payment.amount,method:`Razorpay ${payment.method||'checkout'}`,status:'Successful',external_reference:payment.id,note:`Razorpay order ${payment.order_id}`,paid_at:payment.created_at?new Date(payment.created_at*1000):now});
    await trx('checkout_quotes').where({id:quote.id}).update({used_at:now,razorpay_payment_id:payment.id,subscription_id:subId});
    if(quote.discount_id) await trx('discounts').where({id:quote.discount_id}).increment('times_used',1);
    await trx('notifications').insert({id:id(),user_id:quote.customer_id,type:'payment',title:'Payment received',detail:`Your ${plan.name} subscription is active.`});
    await audit(trx,quote.customer_id,'checkout.fulfill','subscription',subId,{invoiceId,paymentId:payment.id,orderId:payment.order_id});
    if(eventId) await trx('razorpay_events').insert({event_id:eventId,event_type:eventType||'payment.captured',payment_id:payment.id,processed_at:now});
    return {subscriptionId:subId,status:'active'};
  });
  return result;
}

export async function fulfillInvoicePayment(payment,{eventId,eventType}={}) {
  if(payment.status!=='captured'||payment.currency!=='INR'||!payment.order_id||!payment.id||!Number.isInteger(payment.amount)) throw httpError(409,'Payment is not captured or does not match the order.');
  return db.transaction(async trx=>{
    if(eventId&&await trx('razorpay_events').where({event_id:eventId}).first()) return {duplicate:true};
    const order=await trx('invoice_orders').where({razorpay_order_id:payment.order_id}).forUpdate().first();
    if(!order||Number(order.amount_cents)!==payment.amount) throw httpError(409,'Invoice order amount mismatch.');
    if(order.razorpay_payment_id){if(order.razorpay_payment_id!==payment.id) throw httpError(409,'Order was paid by another payment.');if(eventId) await trx('razorpay_events').insert({event_id:eventId,event_type:eventType||'payment.captured',payment_id:payment.id,processed_at:new Date()}).onConflict('event_id').ignore();return {invoiceId:order.invoice_id,status:'paid',duplicate:true};}
    const invoice=await trx('invoices').where({id:order.invoice_id,customer_id:order.customer_id}).forUpdate().first();if(!invoice) throw httpError(409,'Invoice no longer exists.');
    const paid=await trx('payments').where({invoice_id:invoice.id,status:'Successful'}).sum({amount:'amount_cents'}).first();
    const overpayment=invoice.status!=='Confirmed'||Number(paid.amount||0)+payment.amount>invoice.total_cents;
    const paymentId=id();const now=new Date();
    await trx('payments').insert({id:paymentId,invoice_id:invoice.id,customer_id:order.customer_id,amount_cents:payment.amount,method:`Razorpay ${payment.method||'checkout'}`,status:'Successful',external_reference:payment.id,note:`Razorpay order ${payment.order_id}`,paid_at:payment.created_at?new Date(payment.created_at*1000):now});
    await trx('invoice_orders').where({id:order.id}).update({razorpay_payment_id:payment.id});
    if(!overpayment) await trx('invoices').where({id:invoice.id}).update({status:'Paid',updated_at:now});
    else await trx('integrity_cases').insert({id:id(),fingerprint:`overpayment:${payment.id}`,kind:'Payment exception',subscription_id:invoice.subscription_id,invoice_id:invoice.id,customer_id:order.customer_id,status:'Open',impact_cents:Math.max(0,Number(paid.amount||0)+payment.amount-invoice.total_cents),explanation:`Captured payment ${payment.id} needs review against invoice ${invoice.number}, whose status or remaining balance changed after order creation.`,recommended_action:'Verify all payments and refund or allocate any excess before resolving.'}).onConflict('fingerprint').ignore();
    await audit(trx,order.customer_id,'invoice.payment.capture','invoice',invoice.id,{paymentId,providerPaymentId:payment.id,overpayment});
    if(eventId) await trx('razorpay_events').insert({event_id:eventId,event_type:eventType||'payment.captured',payment_id:payment.id,processed_at:now});
    return {invoiceId:invoice.id,status:overpayment?'attention':'paid'};
  });
}

export async function recordRazorpayEvent(eventId,eventType,paymentId) {
  await db('razorpay_events').insert({event_id:eventId,event_type:eventType,payment_id:paymentId||null,processed_at:new Date()}).onConflict('event_id').ignore();
}
