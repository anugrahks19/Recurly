const day = offset => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10); };
export const demoPlans = [
  { id: 'studio', name: 'Studio', monthly: 24, annual: 240, trialDays: 14, description: 'The essentials for independent teams.', features: ['1 workspace', '3 team seats', 'Core reporting', 'Email support'] },
  { id: 'atelier', name: 'Atelier', monthly: 48, annual: 480, trialDays: 14, description: 'More room for a growing operation.', features: ['3 workspaces', '10 team seats', 'Advanced reporting', 'Priority support'] },
  { id: 'maison', name: 'Maison', monthly: 120, annual: 1200, trialDays: 0, description: 'Complete control for established teams.', features: ['Unlimited workspaces', 'Unlimited seats', 'Custom reporting', 'Dedicated support'] },
];
export const demoData = {
  profile: { name: 'Eleanor Vance', email: 'eleanor@example.com', phone: '+1 555 010 2741', company: 'Vance Atelier', notifications: { email: true, renewal: true, product: false } },
  subscriptions: [
    { id: 'sub_demo_1', planId: 'atelier', status: 'Active', interval: 'monthly', amount: 48, startedAt: day(-95), nextBillingAt: day(12), history: [{ date: day(-95), title: 'Atelier subscription started' }, { date: day(-31), title: 'Payment received' }] },
    { id: 'sub_demo_2', planId: 'studio', status: 'Cancelled', interval: 'annual', amount: 240, startedAt: day(-500), endedAt: day(-120), history: [{ date: day(-500), title: 'Studio subscription started' }, { date: day(-120), title: 'Subscription cancelled' }] },
  ],
  invoices: [
    { id: 'INV-2026-104', date: day(-31), dueDate: day(-30), amount: 48, status: 'Paid', description: 'Atelier monthly subscription', receiptAvailable: true },
    { id: 'INV-2026-105', date: day(12), dueDate: day(12), amount: 48, status: 'Upcoming', description: 'Atelier monthly subscription', receiptAvailable: false },
    { id: 'INV-2026-093', date: day(-61), dueDate: day(-60), amount: 48, status: 'Paid', description: 'Atelier monthly subscription', receiptAvailable: true },
  ],
  payments: [
    { id: 'PAY-4831', date: day(-31), amount: 48, status: 'Successful', method: 'Visa ending 4242', invoiceId: 'INV-2026-104' },
    { id: 'PAY-4756', date: day(-61), amount: 48, status: 'Successful', method: 'Visa ending 4242', invoiceId: 'INV-2026-093' },
  ],
  paymentMethods: [{ id: 'pm_demo_1', brand: 'Visa', last4: '4242', expiry: '08/2028', isDefault: true }],
  notifications: [
    { id: 'N-1', type: 'renewal', title: 'Your renewal is coming up', detail: `Atelier renews on ${day(12)}.`, date: day(-1), read: false },
    { id: 'N-2', type: 'payment', title: 'Payment received', detail: 'Your $48.00 payment was successful.', date: day(-31), read: true },
    { id: 'N-3', type: 'invoice', title: 'Invoice available', detail: 'Your latest invoice is ready to view.', date: day(-31), read: true },
  ],
  support: [{ id: 'CASE-101', category: 'Billing', subject: 'Billing address question', description: 'How can I update my billing address?', status: 'Resolved', date: day(-44), replies: [{ from: 'Support', date: day(-43), text: 'You can update it in Profile settings.' }] }],
  coupons: [{ code: 'WELCOME10', kind: 'percent', value: 10, expiresAt: day(45), eligiblePlans: ['studio', 'atelier'] }],
};
