import { date } from './lib.js';

export function discountBase(discount, { amountCents, quantity, productLines = [] }) {
  if(discount?.scope === 'product') {
    const lines=productLines.filter(l=>l.product_id===discount.product_id);
    return {amountCents:lines.reduce((sum,l)=>sum+Number(l.total_cents),0),quantity:lines.reduce((sum,l)=>sum+Number(l.quantity),0)};
  }
  return {amountCents,quantity};
}

export function discountEligible(discount, { planId, amountCents, quantity, productLines = [], on = new Date() }) {
  if (!discount || !discount.active || !['subscription','product'].includes(discount.scope)) return false;
  if (discount.plan_id && discount.plan_id !== planId) return false;
  if (discount.scope==='product' && !discount.product_id) return false;
  if (discount.starts_at && new Date(discount.starts_at) > on) return false;
  if (discount.ends_at && date(discount.ends_at) < date(on)) return false;
  if (discount.usage_limit !== null && Number(discount.times_used) >= Number(discount.usage_limit)) return false;
  const base=discountBase(discount,{amountCents,quantity,productLines});
  return base.amountCents>0 && base.amountCents >= discount.minimum_cents && base.quantity >= discount.minimum_quantity;
}

export function discountAmount(discount, amountCents) {
  return Math.min(amountCents, discount.kind === 'percent' ? Math.round(amountCents * discount.value / 100) : discount.value);
}
