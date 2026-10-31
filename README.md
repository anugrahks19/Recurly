# Recurly subscription management

Standalone React and Express application for customer subscriptions, staff quotations, and administration. The [problem overview](docs/problem-overview.md) and [completion guide](PROJECT_COMPLETION_GUIDE.md) describe the scope and verified state.

## Architecture

```text
Browser → frontend/ (React 18, React Router 7, Vite 6)
        → backend/ (Node 20+, Express 5 REST API)
        → PostgreSQL or MySQL (Knex migrations)
        ↘ Razorpay Standard Checkout and signed webhooks
        ↘ SMTP email
```

| Path | Responsibility |
| --- | --- |
| `frontend/src/features/public` | Landing page |
| `frontend/src/features/auth` | Signup, login, role routing, password reset |
| `frontend/src/features/customer` | Plans, checkout, subscriptions, invoices, payments, profile, support |
| `frontend/src/features/staff` | Customer management, discounts, quotations, admin messages |
| `frontend/src/features/admin` | Catalog, subscriptions, billing, reports, revenue integrity |
| `backend/src` | API, authentication, billing, Razorpay, mail, audit, jobs |
| `backend/src/migrations` | SQL schema (`001` through `006`) |

After login, customers go to `/customer/dashboard`, staff to `/staff/dashboard`, and admins to `/admin`. Public signup creates customer accounts. Admins issue staff accounts and special IDs; the initial admin is created by the CLI bootstrap command. API role and ownership checks enforce access independently of browser routing. Production Express serves the built `frontend/dist` and `/api` from one origin.

## Local development

Prerequisites: Node.js 20+, npm, and an empty PostgreSQL or MySQL database.

```powershell
cd backend
npm.cmd ci
Copy-Item .env.example .env
# Edit .env: set DATABASE_CLIENT, DATABASE_URL, FRONTEND_ORIGIN.
npm.cmd run migrate
# Set the four BOOTSTRAP_ADMIN_* variables in .env once.
npm.cmd run bootstrap-admin
npm.cmd run dev
```

In another terminal:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open `http://127.0.0.1:5173/` (or the port Vite prints if occupied). Vite proxies `/api` to port 3001. Remove bootstrap secrets from `.env` after creating the admin. Do not commit `.env`.

## Production deployment

Deploy one Node web service with a managed PostgreSQL database. Set the service root to the repository root.

| Setting | Value |
| --- | --- |
| Build | `npm ci --omit=dev --prefix backend && npm ci --include=dev --prefix frontend && npm run build --prefix frontend` |
| Start | `npm run migrate --prefix backend && npm start --prefix backend` |
| Required environment | `NODE_ENV=production`, `DATABASE_CLIENT=pg`, `DATABASE_URL=<managed database internal URL>`, `COOKIE_SECURE=true` |
| Public origin | `APP_PUBLIC_URL=https://<service-hostname>`; set `FRONTEND_ORIGIN` likewise unless Render provides its hostname automatically |

Use HTTPS, durable managed SQL, backups, monitoring, and a scheduled `npm run billing --prefix backend` for recurring invoices. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in the host's secret store, enable automatic capture, and register `https://<service-hostname>/api/webhooks/razorpay`. See [Razorpay setup](docs/razorpay-setup.md). Configure `SMTP_*` for password resets and invoice email. Neither payment nor email can be verified end to end without credentials. Razorpay hosts payment entry; the app does not store raw card data.

## Verification and limits

Run `npm run test --prefix backend` and `npm run build --prefix frontend`. The tests cover billing periods, migrations, Razorpay verification, revenue integrity, and health scores. Live SQL, SMTP, and Razorpay integration still require provisioned services and credentials. A free Render database is suitable for short staging use, not durable production storage.

See the [tech stack](techstack.md) and [completion guide](PROJECT_COMPLETION_GUIDE.md) for the feature inventory and remaining operational work.
