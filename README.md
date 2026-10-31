# Recurly

A standalone subscription management app with one React frontend and an Express backend. Customer, staff, and admin workspaces are under `frontend/`; SQL API code and migrations are under `backend/`. See [techstack.md](techstack.md) for the architecture and current limits.

## Run locally

1. Create an empty PostgreSQL or MySQL database.
2. In `backend/`, run `npm ci`, copy `.env.example` to `.env`, and set `DATABASE_CLIENT`, `DATABASE_URL`, and `FRONTEND_ORIGIN`.
3. Run `npm run migrate`. Set the four `BOOTSTRAP_ADMIN_*` variables and run `npm run bootstrap-admin` once. Remove those secrets afterward.
4. Run `npm run dev` in `backend/` and `frontend/` separately. The frontend runs at `http://127.0.0.1:5173` and proxies API calls to the backend on port 3001.

Public signup creates customer accounts. Admins create staff accounts and issue their special IDs. Staff and admins choose their role at login and must provide the issued ID. Customers can view their own data and create support cases. Admins can create plans, products, discounts, subscriptions, invoices, and record externally verified payments. Schedule `npm run billing` to generate due invoices.

No SQL server or payment provider is bundled. Until a provider is configured, the API rejects checkout and card management rather than simulating charges. SMTP must be configured for password reset email.
