export const seedData = {
  customers: [
    { id: 'CUS-1001', name: 'Julian Vance', email: 'julian@vanceatelier.com', company: 'Vance Atelier', plan: 'Maison', status: 'Active', renewal: '2026-11-14', notes: 'Prefers email updates.' },
    { id: 'CUS-1002', name: 'Camille Laurent', email: 'c.laurent@designparis.fr', company: 'Design Paris', plan: 'Atelier', status: 'Past Due', renewal: '2026-11-03', notes: 'Follow up on payment method.' },
    { id: 'CUS-1003', name: 'Marcus Thorne', email: 'm.thorne@hudsonpress.org', company: 'Hudson Press', plan: 'Studio', status: 'Active', renewal: '2026-11-28', notes: '' },
    { id: 'CUS-1004', name: 'Siobhan Gallagher', email: 'siobhan@archive-review.com', company: 'Archive Review', plan: 'Maison', status: 'Paused', renewal: '2026-12-01', notes: 'Resumes in December.' },
    { id: 'CUS-1005', name: 'Aris Thorne', email: 'aris@fondation-moderne.org', company: 'Fondation Moderne', plan: 'Atelier', status: 'Active', renewal: '2026-11-04', notes: '' },
  ],
  discounts: [
    { id: 'DISC-01', code: 'WELCOME10', type: 'Percentage', value: 10, status: 'Active', expires: '2026-12-31' },
    { id: 'DISC-02', code: 'ATELIER20', type: 'Percentage', value: 20, status: 'Active', expires: '2026-11-30' },
    { id: 'DISC-03', code: 'LOYAL5', type: 'Fixed', value: 5, status: 'Expired', expires: '2026-09-30' },
  ],
  queries: [
    { id: 'QRY-301', customerId: 'CUS-1002', subject: 'Payment method update', category: 'Billing', priority: 'High', status: 'Open', detail: 'Customer requested help updating their card.', createdAt: '2026-10-30' },
    { id: 'QRY-302', customerId: 'CUS-1004', subject: 'Pause confirmation', category: 'Subscription', priority: 'Normal', status: 'In Progress', detail: 'Confirm the planned resume date.', createdAt: '2026-10-29' },
  ],
  quotations: [
    { id: 'QUO-201', customerId: 'CUS-1001', plan: 'Maison', seats: 3, unitPrice: 120, discountCode: '', status: 'Draft', note: 'Annual team expansion', createdAt: '2026-10-30' },
  ],
  adminMessages: [],
};
