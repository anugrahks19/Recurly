# Integration notes

Move `src/features/admin/` to `frontend/src/features/admin/`. Move the font assets and `src/shared/styles/theme.css` into the unified frontend's shared asset and style locations, then update the CSS URLs. Register `Dashboard` at `/admin/dashboard` behind the application's shared Admin route guard. Consolidate the local header, route handling, and reusable UI with the common application components. The local `src/index.jsx`, `index.html`, and package manifest are development-only and must not become a second production entry point.

This Build phase implements the dashboard composition, responsive ledger, date range selection, record search, status filter, sorting, pagination, CSV export, notifications, record detail dialog, and sample route destinations. It does not implement the full Staff, Customer, Subscription, Plan, Billing, Payment, Coupon, Report, Settings, or Audit management workflows. Those routes show read-only sample records and need their own feature implementation.

No authentication or backend authorization is implemented here. The `Admin` header text names the workspace view only. The unified frontend must use the shared auth context, and the backend must enforce sensitive actions.
