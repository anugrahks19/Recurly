# Mock data and API contract

`src/features/customer/services/mockData.js` contains illustrative plans, one account profile, subscriptions, invoices, payments, payment methods with brand/last four/expiry only, notifications, coupons, and support cases. `customerApi.js` reads that fixture when `VITE_API_BASE_URL` is absent. Profile edits, notification reads, and support drafts use localStorage key `recurly-customer-demo-v1` and remain on this browser only.

Required backend endpoints, all scoped to the authenticated user:

| Method and path after `/api/customer/me` | Purpose |
| --- | --- |
| `GET /portal` | Return profile, plans, subscriptions, invoices, payments, paymentMethods, notifications, support, coupons |
| `POST /coupons/validate` | Validate code for plan, interval, and customer eligibility |
| `POST /checkout/quote` | Return server quote with `id`, `subtotal`, `discount`, `tax`, `total`, trial and billing terms |
| `POST /checkout/confirm` | Confirm quote and payment method; return `status`, `subscriptionId`, `message` |
| `POST /subscriptions/:id/preview-change` | Return `id`, `proration`, `nextCharge`, `effectiveAt` |
| `POST /subscriptions/:id/change-plan` | Apply reviewed plan change |
| `POST /subscriptions/:id/pause`, `/resume`, `/cancel` | Apply lifecycle change |
| `GET /invoices/:id/invoice`, `/receipt` | Return authorized PDF blob |
| `POST /payment-methods/setup` | Return secure hosted `redirectUrl` |
| `POST /payment-methods/:id/update` | Return secure hosted `redirectUrl` |
| `POST /payment-methods/:id/default` | Set default method |
| `DELETE /payment-methods/:id` | Remove permitted method |
| `PATCH /profile` | Save account profile and preferences |
| `POST /notifications/:id/read` | Mark notification read |
| `POST /support` | Create support case |
| `POST /support/:id/replies` | Reply to a case |

The backend must own final prices, tax, proration, trial eligibility, coupon eligibility, payment capture, receipt generation, and ownership checks. The frontend never interprets a demo estimate as a completed purchase. A real checkout confirmation button appears only after a successful backend quote. Payment methods are tokenized and added or updated through a secure hosted provider, never through raw card fields here.

## Dashboard and confirmation notes

The dashboard uses only the existing portal response: profile, subscriptions, plan features, default masked payment method, notifications, history, and invoices. No endpoint was added. Member initials are used instead of a stock photograph. The displayed card contains only network, last four digits, and expiry. The billing accent line is decorative, not elapsed-period progress.

Checkout confirmation recognises status values `confirmed`, `active`, and `succeeded` as success; `pending` is processing. Other values display an attention state and the backend message. Return a stable quote ID and reject expired or mismatched quotes server-side. The frontend invalidates quotes on selection changes and ignores stale pricing responses. All financial endpoints must remain idempotent and validate ownership and plan permissions.
