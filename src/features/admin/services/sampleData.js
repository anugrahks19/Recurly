// Representative records for the independent Admin workspace. Replace through the shared API layer at integration.
export const customers = [
  { id: 'CUS-1042', name: 'Avery Chen', email: 'avery@example.test', joined: '2026-10-22' },
  { id: 'CUS-1041', name: 'Jordan Ellis', email: 'jordan@example.test', joined: '2026-10-16' },
  { id: 'CUS-1040', name: 'Samira Patel', email: 'samira@example.test', joined: '2026-10-07' },
  { id: 'CUS-1039', name: 'Noah Brooks', email: 'noah@example.test', joined: '2026-09-28' },
  { id: 'CUS-1038', name: 'Maya Rivera', email: 'maya@example.test', joined: '2026-09-18' },
  { id: 'CUS-1037', name: 'Leo Morgan', email: 'leo@example.test', joined: '2026-09-09' },
  { id: 'CUS-1036', name: 'Priya Shah', email: 'priya@example.test', joined: '2026-08-25' },
  { id: 'CUS-1035', name: 'Elliot Park', email: 'elliot@example.test', joined: '2026-08-11' },
  { id: 'CUS-1034', name: 'Riley Stone', email: 'riley@example.test', joined: '2026-07-30' },
  { id: 'CUS-1033', name: 'Amara Okafor', email: 'amara@example.test', joined: '2026-07-18' },
  { id: 'CUS-1032', name: 'Theo Wright', email: 'theo@example.test', joined: '2026-07-04' },
  { id: 'CUS-1031', name: 'Nina Flores', email: 'nina@example.test', joined: '2026-06-12' },
];

export const subscriptions = [
  { id: 'SUB-2081', customerId: 'CUS-1042', plan: 'Growth', status: 'Active', started: '2026-10-22', renewal: '2026-11-02', amount: 79, interval: 'month' },
  { id: 'SUB-2080', customerId: 'CUS-1041', plan: 'Core', status: 'Past due', started: '2026-10-16', renewal: '2026-11-03', amount: 39, interval: 'month' },
  { id: 'SUB-2079', customerId: 'CUS-1040', plan: 'Growth', status: 'Active', started: '2026-10-07', renewal: '2026-11-04', amount: 79, interval: 'month' },
  { id: 'SUB-2078', customerId: 'CUS-1039', plan: 'Starter', status: 'Trial', started: '2026-09-28', renewal: '2026-11-05', amount: 19, interval: 'month' },
  { id: 'SUB-2077', customerId: 'CUS-1038', plan: 'Scale', status: 'Active', started: '2026-09-18', renewal: '2026-11-06', amount: 149, interval: 'month' },
  { id: 'SUB-2076', customerId: 'CUS-1037', plan: 'Core', status: 'Active', started: '2026-09-09', renewal: '2026-11-07', amount: 39, interval: 'month' },
  { id: 'SUB-2075', customerId: 'CUS-1036', plan: 'Growth', status: 'Paused', started: '2026-08-25', renewal: '2026-11-13', amount: 79, interval: 'month' },
  { id: 'SUB-2074', customerId: 'CUS-1035', plan: 'Scale', status: 'Active', started: '2026-08-11', renewal: '2026-11-17', amount: 149, interval: 'month' },
  { id: 'SUB-2073', customerId: 'CUS-1034', plan: 'Core', status: 'Active', started: '2026-07-30', renewal: '2026-11-19', amount: 39, interval: 'month' },
  { id: 'SUB-2072', customerId: 'CUS-1033', plan: 'Starter', status: 'Cancelled', started: '2026-07-18', renewal: '2026-10-19', amount: 19, interval: 'month' },
  { id: 'SUB-2071', customerId: 'CUS-1032', plan: 'Growth', status: 'Active', started: '2026-07-04', renewal: '2026-11-22', amount: 79, interval: 'month' },
  { id: 'SUB-2070', customerId: 'CUS-1031', plan: 'Core', status: 'Expired', started: '2026-06-12', renewal: '2026-09-20', amount: 39, interval: 'month' },
];

export const payments = [
  { id: 'PAY-5021', customerId: 'CUS-1042', date: '2026-10-29', amount: 79, status: 'Paid' },
  { id: 'PAY-5020', customerId: 'CUS-1041', date: '2026-10-28', amount: 39, status: 'Failed' },
  { id: 'PAY-5019', customerId: 'CUS-1040', date: '2026-10-24', amount: 79, status: 'Paid' },
  { id: 'PAY-5018', customerId: 'CUS-1038', date: '2026-10-18', amount: 149, status: 'Paid' },
  { id: 'PAY-5017', customerId: 'CUS-1037', date: '2026-10-11', amount: 39, status: 'Paid' },
  { id: 'PAY-5016', customerId: 'CUS-1036', date: '2026-10-03', amount: 79, status: 'Failed' },
  { id: 'PAY-5015', customerId: 'CUS-1035', date: '2026-09-23', amount: 149, status: 'Paid' },
  { id: 'PAY-5014', customerId: 'CUS-1034', date: '2026-09-16', amount: 39, status: 'Paid' },
  { id: 'PAY-5013', customerId: 'CUS-1033', date: '2026-09-04', amount: 19, status: 'Failed' },
  { id: 'PAY-5012', customerId: 'CUS-1032', date: '2026-08-17', amount: 79, status: 'Paid' },
];

export const invoices = [
  { id: 'INV-3108', customerId: 'CUS-1041', date: '2026-10-28', amount: 39, status: 'Overdue' },
  { id: 'INV-3107', customerId: 'CUS-1039', date: '2026-10-23', amount: 19, status: 'Pending' },
  { id: 'INV-3106', customerId: 'CUS-1036', date: '2026-10-03', amount: 79, status: 'Pending' },
];

export const billingEvents = [
  { id: 'EVT-1', customerId: 'CUS-1042', date: '2026-11-02', amount: 79, state: 'Ready', type: 'Renewal' },
  { id: 'EVT-2', customerId: 'CUS-1041', date: '2026-11-03', amount: 39, state: 'Retry', type: 'Payment retry' },
  { id: 'EVT-3', customerId: 'CUS-1040', date: '2026-11-04', amount: 79, state: 'Ready', type: 'Renewal' },
  { id: 'EVT-4', customerId: 'CUS-1038', date: '2026-11-06', amount: 149, state: 'Ready', type: 'Renewal' },
];

export const staff = [
  { id: 'STF-01', name: 'Admin Operator', status: 'Active', role: 'Platform admin' },
  { id: 'STF-02', name: 'Billing Specialist', status: 'Active', role: 'Billing operations' },
  { id: 'STF-03', name: 'Support Specialist', status: 'Active', role: 'Customer support' },
];
export const plans = [
  { id: 'PLAN-01', name: 'Starter', status: 'Available', amount: 19, interval: 'month' },
  { id: 'PLAN-02', name: 'Core', status: 'Available', amount: 39, interval: 'month' },
  { id: 'PLAN-03', name: 'Growth', status: 'Available', amount: 79, interval: 'month' },
  { id: 'PLAN-04', name: 'Scale', status: 'Available', amount: 149, interval: 'month' },
];
export const coupons = [
  { id: 'CPN-01', name: 'WELCOME10', status: 'Enabled', discount: '10%', uses: 4 },
  { id: 'CPN-02', name: 'SAVE25', status: 'Enabled', discount: '$25', uses: 2 },
];
export const auditLogs = [
  { id: 'AUD-01', name: 'Plan availability reviewed', status: 'Recorded', date: '2026-10-29' },
  { id: 'AUD-02', name: 'Invoice status reviewed', status: 'Recorded', date: '2026-10-28' },
];
export const settings = [
  { id: 'SET-01', name: 'Currency', status: 'USD' },
  { id: 'SET-02', name: 'Billing interval', status: 'Monthly' },
  { id: 'SET-03', name: 'Notifications', status: 'Enabled' },
];
export const reports = [
  { id: 'RPT-01', name: 'Recurring revenue', status: 'Sample view' },
  { id: 'RPT-02', name: 'Subscription growth', status: 'Sample view' },
  { id: 'RPT-03', name: 'Plan distribution', status: 'Sample view' },
  { id: 'RPT-04', name: 'Failed payments', status: 'Sample view' },
];

export const customerById = (id) => customers.find((person) => person.id === id);
export const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
export const shortDate = (value) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
