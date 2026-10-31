# Sample data and API replacement

`src/features/admin/services/sampleData.js` contains representative customers, subscriptions, payments, invoices, billing events, staff, plans, coupons, settings, reports, and audit entries. Names, dates, IDs, amounts, statuses, totals, and role labels are invented for UI testing. The dashboard visibly identifies the dataset as sample data.

Replace these fixtures through a shared service abstraction. Required read endpoints include dashboard metrics by date range, subscriptions with search/filter/sort/pagination, upcoming billing events, customers, invoices, payments, and notifications. CSV export currently downloads the filtered sample subscriptions in the browser. In production, export should use an authorized endpoint or the exact currently loaded dataset with clear scope. All mutation endpoints, permission checks, and confirmations are still required for the later management modules.

The sample reporting date is October 31, 2026. Replace it with a server-supplied reporting clock before publishing.
