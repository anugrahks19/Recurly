# Customer routes

| Route | Page |
| --- | --- |
| `/customer/dashboard` | `Dashboard` |
| `/customer/plans` | `Plans` |
| `/customer/plans/:planId` | `PlanDetails` |
| `/customer/checkout/:planId` | `Checkout` |
| `/customer/subscriptions` | `Subscriptions` |
| `/customer/subscriptions/:subscriptionId` | `SubscriptionDetails` |
| `/customer/billing` | `Billing` |
| `/customer/invoices` | `Invoices` |
| `/customer/payments` | `Payments` |
| `/customer/payment-methods` | `PaymentMethods` |
| `/customer/notifications` | `Notifications` |
| `/customer/profile` | `Profile` |
| `/customer/support` | `Support` |

`CustomerRoutes.jsx` is the independent development route table. In the unified app, register its children under a single `/customer` route protected for role `customer`, with `CustomerLayout` as the layout. `/login` and `/register` remain in the shared auth feature. IDs in customer URLs only select records already returned by the account-scoped API; the backend must independently verify ownership.
