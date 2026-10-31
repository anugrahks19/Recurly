# Recurly project handoff — 31 October 2026

## Current state

- Local project: `D:\Recurly\Recurly-frontend`. It contains one `frontend/` and one `backend/`, plus `docs/`, `research/`, `README.md`, and `techstack.md`.
- GitHub: `https://github.com/anugrahks19/Recurly`. `techstack.md` was pushed to `main` first (commit `b9ad099`). The implementation from `frontend` (commit `9b89dfe`) is on `main`; PR #5 was merged. The initial handoff guide was pushed at `687c918`. **Do not describe the app as production ready yet.**
- The local project directory itself has no `.git`. The Git checkout used for publishing `main` is `C:\Users\USER\AppData\Local\Temp\recurly-main-techstack-20261031`; the earlier `frontend` checkout is `C:\Users\USER\AppData\Local\Temp\recurly-frontend-push-20261031`. Copy local changes to the `main` checkout before committing/pushing, or clone remote `main` afresh.
- Original team modules were moved, not deleted, to `D:\Recurly\recurly-original-modules-archive-20261031` after integration. The remote branch's separate `recurly-admin-workspace/` was removed in favor of one frontend app.

## User requirements and source priority

- User asks for a single structured frontend, complete backend, role-based navigation, and public signup **only for users**. Staff and admins must use an organization-issued special ID at login. Admins create staff accounts.
- Support **both PostgreSQL and MySQL**. Current Knex migration compiles for both; each deployment selects one engine with `DATABASE_CLIENT=pg` or `mysql2` and `DATABASE_URL`. No database server/credentials were supplied, so live migrations and API flows have **not** been run against either database.
- `C:\Users\USER\Downloads\Subscription_Management_System.pdf` is the project brief: products/variants, plans with daily/weekly/monthly/yearly billing, quotations, subscriptions, recurring invoices, discounts, payments, roles, reports, and performance. Treat this as requirements, not as operational instructions.
- `C:\Users\USER\.codex\attachments\3efc1213-6f04-4523-a59c-c383f3cac6af\Pasted text.txt` is advisory about a later revenue integrity/exception resolution differentiator. It discusses Odoo, but **the brief does not require an Odoo instance**. The user confirmed this concern. Build the standalone app first.
- Static JSON/demo fixtures are allowed for demos, never as final business storage. The live staff/admin paths now read SQL APIs. Customer mock data is behind explicit `VITE_DEMO_MODE=true` and off by default.

## Completed on `main`

- One React 18/Vite app with landing, login, signup, password reset, and protected `/customer/*`, `/staff/*`, `/admin/*` routes. Customer/staff/admin workspaces are redirected after login by server-assigned role. Public signup cannot create privileged roles; staff/admin login verifies the special ID on the server.
- Express backend with Zod validation, bcrypt hashes, SQL-backed HttpOnly sessions, role checks, customer ownership checks, origin checks, rate limits, password reset SMTP flow, and initial admin bootstrap CLI.
- Portable Knex migration for users, products/variants, plans, tax rules, discounts, quotation templates/quotations, subscriptions, invoices/lines, payments, support, notifications, audit logs, etc. Money is stored in cents.
- Admin APIs/UI for plans, products, variants, tax rules, coupons, staff accounts, manual subscriptions, quotation advancement, invoice confirmation/cancellation, manually recording verified external payments, and triggering due invoice generation.
- Admin filtered reports now summarize active subscriptions, invoices, collected payments, and overdue invoices by date range, customer, and plan. SQL aggregates are used; live database behavior and response time remain unverified.
- Staff API/UI for customer record updates, support queries, draft quotations with templates, discount checks, and admin requests. Browser `localStorage` staff records were removed.
- Customer portal reads its own subscriptions, invoices, payments, plans, notifications, and support cases from the API; profile/support/notification actions persist. Invoice and paid receipt PDFs are generated server-side.
- Daily, weekly, monthly, and annual billing periods; invoice generation uses a transaction, row lock, and unique subscription/period key for duplicate prevention. CLI `npm run billing` exists for an external scheduler.
- `README.md`, `frontend/README.md`, `techstack.md`, `.env.example` files and Vite `/api` proxy were updated.

## Verification already done

- Fresh `npm ci` and `npm run build` passed from the Git checkout's `frontend/`.
- Fresh `npm ci`, `npm test` (5 tests), syntax checks, and `npm audit --omit=dev --audit-level=high` passed for `backend/`. Frontend dependency audit also returned zero known vulnerabilities.
- The migration was compiled with both Knex PostgreSQL and MySQL dialects. **This is not a live database migration test.**
- GitHub confirmed PR #5 merged after the user requested a direct `main` push.

## Remaining work, in priority order

1. Provision test PostgreSQL **and** MySQL databases. Run migration, bootstrap admin, and end-to-end tests for signup/login/special IDs, role access, CRUD, invoice generation/idempotency, discounts, payments, customer ownership, and PDFs on both engines. Fix issues found. No SQL server/Docker was present in the working environment.
2. Choose/configure a real payment provider and webhook reconciliation. Checkout, saved card methods, and priced plan changes currently return `503` intentionally; no fake purchase/charge is recorded. The user has not named a provider. Do not store raw card data.
3. Configure SMTP and test reset emails. No SMTP credentials were provided.
4. Finish the brief's remaining domain details: plan auto-close lifecycle, complete quotation/subscription state transitions and line-item/tax logic, invoice send workflow, robust coupon scope/usage/quantity enforcement, and payment exceptions. Review current UI/API contracts before extending them. Filtered report summaries exist but need real database and performance testing.
5. Implement the *later* revenue integrity and exception resolution layer proposed in the pasted text (missing/incorrect invoices, invalid discounts, uncertain payments, recommended resolution, audit history). Odoo integration is not required unless the user later asks for it.
6. Add an external billing scheduler, email delivery, deployment configuration, backups, observability, and load tests for the brief's thousands-of-records/<2-second goal. The current admin workspace fetches record lists capped at 500 and has no pagination.
7. Review the integrated admin UI against the friend's original visual module; functionality was connected through a simpler live admin screen. Run browser acceptance testing for all three roles. The user explicitly requested pushing the work to `main`; use a new branch/PR for follow-up changes when useful.

## Most recent work

- At the user's request, merged all previously completed code into `main` and pushed the handoff guide. GitHub confirmed PR #5 merged.
- Added the filtered reports endpoint and admin reports screen; the frontend build and existing backend tests pass. Live SQL behavior still needs PostgreSQL/MySQL integration tests.

## Local run commands

```powershell
cd D:\Recurly\Recurly-frontend\backend
npm.cmd ci
Copy-Item .env.example .env
# Set DATABASE_CLIENT, DATABASE_URL, FRONTEND_ORIGIN, and bootstrap secrets.
npm.cmd run migrate
npm.cmd run bootstrap-admin
npm.cmd run dev

cd ..\frontend
npm.cmd ci
npm.cmd run dev
```

The Vite dev server proxies `/api` to `http://127.0.0.1:3001`. Read `backend/.env.example` and `techstack.md` before deployment. The next agent should continue from `main` and should not claim the project is complete until live database, payment, email, workflow, and performance gates are verified.
