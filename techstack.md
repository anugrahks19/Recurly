# Recurly tech stack

This is the target stack for the final subscription management project, with the current implementation called out separately. Today the repository contains frontend workspaces only. Backend and database work still need to be built.

## Stack at a glance

| Layer | Current implementation | Final project direction |
| --- | --- | --- |
| Frontend | A unified React 18 app plus an independent React 19 admin workspace; both use JavaScript/JSX, HTML, CSS, and Vite | Integrate the admin workspace into the unified app and connect screens to real API data. |
| Backend | None | Build a server-side REST API. Node.js with Express is the proposed JavaScript stack; the backend framework is not committed in code yet. |
| Database | None | Use a relational database: **MySQL or PostgreSQL**. Confirm with the team whether the brief requires one specific engine or both. Select the actual engine before designing migrations. |
| Authentication | Login/signup UI and a `fetch` client | Backend-managed accounts and sessions with server-enforced User, Staff, and Admin permissions. |
| Data | Staff seed records in browser `localStorage` and admin sample records in JavaScript files | Store users, customers, plans, subscriptions, quotations, invoices, payments, and requests in the relational database. |
| API format | Frontend expects JSON over HTTP | JSON is suitable for API requests and responses; it must not be the final source of business records. |

## Frontend already built

- **Unified app:** React 18.3.1 and React DOM 18.3.1, using JavaScript and JSX. `frontend/index.html` is its HTML entry point.
- **Navigation:** React Router DOM 7.18.5. Public routes are `/`, `/login`, and `/signup`; protected destinations are `/account`, `/admin`, and `/staff/*`.
- **Styling:** Plain CSS and custom properties, with Montserrat, Playfair Display, and Material Symbols loaded from Google Fonts.
- **Tooling:** npm and Vite 6.4.5. `npm ci` installs from the lockfile; `npm run build` creates `frontend/dist/`.
- **State:** React Context holds the current auth user and staff demo records. The staff demo provider currently saves records in browser `localStorage`.
- **Independent admin workspace:** `recurly-admin-workspace/` has a sample-data admin dashboard built with React/React DOM 19.3.1 and Vite 7.3.7. It has its own entry point and is not yet integrated into `frontend/` or the shared auth flow.

The versions above come from the two workspace lockfiles. No Node.js version, deployment host, CI pipeline, or automated test runner is configured yet.

## Backend to build

The proposed architecture is a JavaScript Node.js/Express API with one relational database selected from MySQL and PostgreSQL. Keep business rules, authorization, database access, and billing calculations on the server. The browser should call the API for real records, not import a static data file as its final data source.

The existing frontend contract expects:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a **User** account only. Ignore any client-supplied role. |
| `POST` | `/api/auth/login` | Verify email, password, selected role, and a special ID for Staff/Admin. |
| `GET` | `/api/auth/me` | Return the signed-in account and its server-assigned role. |
| `POST` | `/api/auth/logout` | End the session. |

The backend also needs customer, plan, subscription, quotation, invoice, payment, and request endpoints as those features move from demo data to real data. Define the tables, migrations, validation, and API shapes with the backend implementation. Avoid introducing two database engines merely because both are allowed; use both only if the project brief explicitly requires that.

For authentication, hash passwords and special IDs, protect sessions with secure HttpOnly cookies, validate inputs, limit login attempts, and enforce roles and customer ownership on every protected API request. A frontend role selector or route guard is not authorization. See `frontend/README.md` for the current frontend request/response contract.

## Demo data versus final data

`frontend/src/features/staff/components/mockData.js` and `StaffDataProvider.jsx`, plus `recurly-admin-workspace/src/features/admin/services/sampleData.js`, are acceptable for UI demos while the backend is unfinished. Before final submission, replace the staff `localStorage` flow and admin sample records with API calls backed by MySQL or PostgreSQL. The user destination is a placeholder; the independent admin dashboard must be integrated and connected to real data.

Static JSON or hardcoded arrays may remain as test fixtures, sample seeds, or clearly labeled demos. They must not serve as the production database. JSON returned by an API is a transport format and does not conflict with this rule.

## Current gaps

The backend, SQL database, migrations, real authentication, persistent business APIs, and production user/admin data flows are not implemented. The admin dashboard exists as a separate sample-data workspace. Odoo and payment providers appear in research, but this repository has no integration with them. The final database engine and backend framework should be recorded here once the team confirms them.
