# Customer portal handover

## Implemented

The customer layout, dashboard, plans, plan details, checkout, subscriptions, subscription details, billing, invoices, payments, payment methods, notifications, profile, and support pages are complete as frontend screens. The visual theme comes from the provided Stitch reference and matches the staff workspace tokens, including `#F7FAF8` for the main background.

## Move into the unified frontend

| Independent workspace | Unified destination |
| --- | --- |
| `src/features/customer/pages/*` | `frontend/src/features/customer/pages/` |
| `src/features/customer/components/*` | `frontend/src/features/customer/components/` |
| `src/features/customer/hooks/*` | `frontend/src/features/customer/hooks/` |
| `src/features/customer/services/*` | `frontend/src/features/customer/services/`, then adapt to shared API layer |
| `src/features/customer/routes/CustomerRoutes.jsx` | Merge routes into `frontend/src/routes/` |
| `src/shared/components/Ui.jsx` | Consolidate into `frontend/src/components/common/` |
| `src/shared/styles/*` | Consolidate into `frontend/src/styles/` |

Keep the unified application's own `App.jsx`, `main.jsx`, router, auth context, theme, and dependency manifest. The local `src/index.jsx` and `index.html` exist only to run this workspace independently.

The shared API must scope every `/api/customer/me/*` request to the authenticated customer. A customer ID is never sent as a route parameter. Frontend route protection improves navigation only; backend authorization must enforce ownership of every subscription, invoice, payment, method, notification, and case.

The user referred to a PRD file, but `D:\customer` was empty when implementation began. The supplied customer portal prompt was used as the working requirements document.
