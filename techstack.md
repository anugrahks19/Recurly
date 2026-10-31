# Recurly tech stack

## Implemented

| Layer | Technology | Role |
| --- | --- | --- |
| Frontend | JavaScript/JSX, HTML, CSS, React 18, React Router 7, Vite 6 | One `frontend/` app for landing, login, signup, customer, staff, and admin workspaces. |
| Backend | Node.js 20+, Express 5, JavaScript | REST API in `backend/`, with server enforced roles and business workflows. |
| Database | PostgreSQL **and** MySQL support through Knex 3 (`pg` and `mysql2` drivers) | One SQL schema and migrations can run on either engine. Choose the engine with `DATABASE_CLIENT` and `DATABASE_URL`. Deployments use one engine at a time; no data is copied automatically between them. |
| Authentication | bcrypt password and special ID hashes, random server sessions in HttpOnly cookies, rate limited login | Public registration creates customer accounts only. Staff accounts require an admin. Initial admin creation uses the CLI bootstrap command. |
| Documents | PDFKit | Customer invoice and paid receipt downloads. |
| Email | Nodemailer over SMTP | Password reset links when SMTP is configured. |
| Validation and security | Zod, Helmet, origin checks, role and ownership checks | Validates API inputs and guards protected operations. |

All live customer, staff, and admin business records are stored in SQL tables. JSON is used as an HTTP response format, and small JSON columns hold plan feature lists and audit details. Customer demo fixtures remain only behind `VITE_DEMO_MODE=true`; they are not the default.

## Database model

The migration defines users, sessions, password resets, products and variants, plans, tax rules, discounts, subscriptions, quotations, invoices and lines, payments, support cases and replies, notifications, admin messages, audit logs, and checkout quotes. Money is stored in integer cents. Recurring invoice generation uses a transaction and a unique subscription/period key to prevent duplicate billing records.

## Current external dependencies and limits

- A running PostgreSQL **or** MySQL server and a `DATABASE_URL` are required to operate the backend. Both dialects are implemented in configuration; there is no bundled database server.
- SMTP credentials are needed for reset emails.
- A payment provider has not been selected. Automated charging, card storage, customer checkout, and priced plan changes are disabled with explicit API errors. Admins can record verified external payments against confirmed invoices. Payment details must not be entered as raw card data.
- Odoo is **not** required by the supplied problem statement. The attached text proposes an Odoo oriented future extension; this repository implements a standalone system.
- The supplied brief also calls for high volume performance and revenue integrity checks. Those require database backed load tests and more implementation before production deployment.

## Local commands

```powershell
cd backend
npm.cmd ci
Copy-Item .env.example .env
# Configure DATABASE_CLIENT, DATABASE_URL, FRONTEND_ORIGIN and bootstrap admin secrets.
npm.cmd run migrate
npm.cmd run bootstrap-admin
npm.cmd run dev

cd ../frontend
npm.cmd ci
npm.cmd run dev
```

The Vite dev server proxies `/api` to `127.0.0.1:3001`. For separate production origins, set `VITE_API_BASE_URL` when building the frontend and `FRONTEND_ORIGIN` on the backend. Run `npm.cmd run billing` on a scheduler for recurring invoices.
