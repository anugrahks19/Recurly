# Routes

Primary page: `/admin/dashboard`.

The header also links to `/admin/staff`, `/admin/customers`, `/admin/subscriptions`, `/admin/plans`, `/admin/billing`, `/admin/invoices`, `/admin/payments`, `/admin/coupons`, `/admin/reports`, `/admin/settings`, and `/admin/audit-logs`. This workspace's lightweight route switch is for standalone development. The final application should register each route with its own Admin page and protect the parent `/admin/*` route through the shared auth contract. Query parameters `record` and `status` carry context from the dashboard to a record view.
