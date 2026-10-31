import { demoData, demoPlans } from './mockData.js';

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
export class ApiRequiredError extends Error { constructor(action = 'This action') { super(`${action} needs the customer backend API. No payment or subscription change was made.`); this.name = 'ApiRequiredError'; } }
const clone = value => JSON.parse(JSON.stringify(value));
const key = 'recurly-customer-demo-v1';
function demoStore() { try { return { ...clone(demoData), ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { return clone(demoData); } }
function saveDemo(patch) { const next = { ...demoStore(), ...patch }; localStorage.setItem(key, JSON.stringify(next)); return next; }

async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(`${baseUrl}/api/customer/me${path}`, { method, credentials: 'include', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal });
  if (!response.ok) { let detail = ''; try { detail = (await response.json()).message || ''; } catch { /* Keep generic error. */ } throw new Error(detail || `Request failed (${response.status}).`); }
  if (response.status === 204) return null;
  return response.json();
}

export const customerApi = {
  async load() { if (isDemo) return { ...demoStore(), plans: clone(demoPlans) }; return request('/portal'); },
  async validateCoupon({ code, planId, interval, quantity }) {
    if (!isDemo) return request('/coupons/validate', { method: 'POST', body: { code, planId, interval, quantity } });
    const coupon = demoStore().coupons.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
    if (!coupon || coupon.expiresAt < new Date().toISOString().slice(0, 10) || !coupon.eligiblePlans.includes(planId)) throw new Error('This code is invalid, expired, or not eligible for this plan.');
    return coupon;
  },
  async checkoutQuote(body) { if (isDemo) throw new ApiRequiredError('Final pricing'); return request('/checkout/quote', { method: 'POST', body }); },
  async purchase(body) { if (isDemo) throw new ApiRequiredError('Subscription purchase'); return request('/checkout/confirm', { method: 'POST', body }); },
  async verifyPurchase(body) { if (isDemo) throw new ApiRequiredError('Payment verification'); return request('/checkout/verify', { method: 'POST', body }); },
  async invoiceOrder(id) { if (isDemo) throw new ApiRequiredError('Invoice payment'); return request(`/invoices/${encodeURIComponent(id)}/order`, { method: 'POST' }); },
  async verifyInvoicePayment(id,body) { if (isDemo) throw new ApiRequiredError('Invoice payment'); return request(`/invoices/${encodeURIComponent(id)}/verify`, { method: 'POST', body }); },
  async previewChange(id, body) { if (isDemo) throw new ApiRequiredError('Plan-change pricing'); return request(`/subscriptions/${encodeURIComponent(id)}/preview-change`, { method: 'POST', body }); },
  async changeSubscription(id, action, body = {}) { if (isDemo) throw new ApiRequiredError('Subscription change'); return request(`/subscriptions/${encodeURIComponent(id)}/${action}`, { method: 'POST', body }); },
  async downloadInvoice(id, kind = 'invoice') {
    if (isDemo) throw new ApiRequiredError('Document download');
    const response = await fetch(`${baseUrl}/api/customer/me/invoices/${encodeURIComponent(id)}/${kind}`, { credentials: 'include' });
    if (!response.ok) throw new Error(`Document download failed (${response.status}).`);
    const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${id}-${kind}.pdf`; link.click(); URL.revokeObjectURL(url);
  },
  async startPaymentMethodSetup() { if (isDemo) throw new ApiRequiredError('Payment method setup'); return request('/payment-methods/setup', { method: 'POST' }); },
  async startPaymentMethodUpdate(id) { if (isDemo) throw new ApiRequiredError('Payment method update'); return request(`/payment-methods/${encodeURIComponent(id)}/update`, { method: 'POST' }); },
  async setDefaultMethod(id) { if (isDemo) throw new ApiRequiredError('Default payment method update'); return request(`/payment-methods/${encodeURIComponent(id)}/default`, { method: 'POST' }); },
  async removeMethod(id) { if (isDemo) throw new ApiRequiredError('Payment method removal'); return request(`/payment-methods/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
  async updateProfile(profile) { if (isDemo) return saveDemo({ profile }); return request('/profile', { method: 'PATCH', body: profile }); },
  async markNotificationRead(id) { if (isDemo) return saveDemo({ notifications: demoStore().notifications.map(n => n.id === id ? { ...n, read: true } : n) }); return request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }); },
  async createSupportCase(body) { if (isDemo) return saveDemo({ support: [{ ...body, id: `DEMO-${Date.now()}`, date: new Date().toISOString().slice(0, 10), status: 'Demo draft', replies: [] }, ...demoStore().support] }); return request('/support', { method: 'POST', body }); },
  async replyToCase(id, text) { if (isDemo) return saveDemo({ support: demoStore().support.map(c => c.id === id ? { ...c, replies: [...c.replies, { from: 'You', date: new Date().toISOString().slice(0, 10), text }] } : c) }); return request(`/support/${encodeURIComponent(id)}/replies`, { method: 'POST', body: { text } }); },
};

export async function openRazorpayCheckout(order, profile) {
  if (!window.Razorpay) await new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=resolve;script.onerror=()=>reject(new Error('Secure checkout could not be loaded.'));document.head.appendChild(script);
  });
  return new Promise((resolve,reject)=>{
    const checkout=new window.Razorpay({key:order.keyId,amount:order.amount,currency:order.currency,name:order.name,order_id:order.orderId,prefill:{name:profile?.name||'',email:profile?.email||''},handler:resolve,modal:{ondismiss:()=>reject(new Error('Checkout was closed before payment.'))}});
    checkout.on('payment.failed',response=>reject(new Error(response.error?.description||'Payment failed.')));
    checkout.open();
  });
}
