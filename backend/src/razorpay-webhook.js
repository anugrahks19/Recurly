import { db } from './db.js';
import { asyncRoute, id } from './lib.js';
import { fulfillCapturedPayment, fulfillInvoicePayment, recordRazorpayEvent, verifyHmac } from './razorpay.js';

export const razorpayWebhook=asyncRoute(async(req,res)=>{
  if(!Buffer.isBuffer(req.body)||!verifyHmac(req.body,req.get('X-Razorpay-Signature'),process.env.RAZORPAY_WEBHOOK_SECRET)) return res.status(400).json({message:'Invalid webhook signature.'});
  const eventId=req.get('x-razorpay-event-id');
  if(!eventId||eventId.length>120) return res.status(400).json({message:'Missing event ID.'});
  let event;try{event=JSON.parse(req.body.toString('utf8'));}catch{return res.status(400).json({message:'Invalid event payload.'});}
  if(!event||typeof event.event!=='string') return res.status(400).json({message:'Invalid event payload.'});
  if(await db('razorpay_events').where({event_id:eventId}).first()) return res.status(200).json({ok:true,duplicate:true});
  const payment=event.payload?.payment?.entity;
  if(event.event==='payment.captured'&&payment){
    const quote=await db('checkout_quotes').where({razorpay_order_id:payment.order_id}).first();
    if(quote) await fulfillCapturedPayment(payment,{eventId,eventType:event.event});
    else if(await db('invoice_orders').where({razorpay_order_id:payment.order_id}).first()) await fulfillInvoicePayment(payment,{eventId,eventType:event.event});
    else await recordRazorpayEvent(eventId,event.event,payment.id);
  } else if(event.event==='payment.failed'&&payment){
    const quote=await db('checkout_quotes').where({razorpay_order_id:payment.order_id}).first();
    if(quote){await db('integrity_cases').insert({id:id(),fingerprint:`checkout-payment:${payment.id}`,kind:'Payment exception',customer_id:quote.customer_id,subscription_id:null,invoice_id:null,status:'Open',impact_cents:quote.total_cents,explanation:`Razorpay reported failed payment ${payment.id} for checkout order ${payment.order_id}.`,recommended_action:'Verify the provider result before asking the customer to retry.'}).onConflict('fingerprint').ignore();}
    await recordRazorpayEvent(eventId,event.event,payment.id);
  } else if(event.event==='payment.refunded'&&payment){
    const recorded=await db('payments').where({external_reference:payment.id}).first();
    if(recorded) await db('integrity_cases').insert({id:id(),fingerprint:`refund:${payment.id}`,kind:'Payment exception',customer_id:recorded.customer_id,invoice_id:recorded.invoice_id,subscription_id:null,status:'Open',impact_cents:Number(payment.amount_refunded||recorded.amount_cents),explanation:`Razorpay reported a refund for payment ${payment.id}. Revenue and invoice status require reconciliation.`,recommended_action:'Verify the refund amount and update the invoice and payment records after provider confirmation.'}).onConflict('fingerprint').ignore();
    await recordRazorpayEvent(eventId,event.event,payment.id);
  } else await recordRazorpayEvent(eventId,event.event,payment?.id);
  res.json({ok:true});
});
