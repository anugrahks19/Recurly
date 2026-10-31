import { date } from './lib.js';

export function scoreSubscriptions({subscriptions,invoices,payments,now=new Date()}) {
  const invoicesBySub=new Map();for(const invoice of invoices){if(!invoice.subscription_id) continue;if(!invoicesBySub.has(invoice.subscription_id)) invoicesBySub.set(invoice.subscription_id,[]);invoicesBySub.get(invoice.subscription_id).push(invoice);}
  const paymentsByInvoice=new Map();for(const payment of payments){if(!paymentsByInvoice.has(payment.invoice_id)) paymentsByInvoice.set(payment.invoice_id,[]);paymentsByInvoice.get(payment.invoice_id).push(payment);}
  return subscriptions.filter(s=>s.status==='Active').map(sub=>{
    const reasons=[];let score=100;
    for(const invoice of invoicesBySub.get(sub.id)||[]){
      if(invoice.status==='Confirmed'&&date(invoice.due_date)<date(now)){score-=20;reasons.push(`Invoice ${invoice.number} is overdue.`);}
      if((paymentsByInvoice.get(invoice.id)||[]).some(p=>['Failed','Unknown'].includes(p.status))){score-=25;reasons.push(`Invoice ${invoice.number} has a failed or uncertain payment.`);}
    }
    if(!sub.auto_renew){score-=10;reasons.push('Automatic renewal is off.');}
    if(sub.expires_on&&date(sub.expires_on)<=date(new Date(now.getTime()+30*86400000))){score-=10;reasons.push(`Subscription expires on ${date(sub.expires_on)}.`);}
    score=Math.max(0,score);
    return {subscriptionId:sub.id,customerId:sub.customer_id,score,risk:score<50?'High':score<80?'Medium':'Low',reasons};
  }).sort((a,b)=>a.score-b.score);
}
