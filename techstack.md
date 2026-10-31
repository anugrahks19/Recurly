# Recurly tech stack

This file describes the code currently on the `frontend` branch. The project research discusses Odoo and other billing systems, but those are not application dependencies or integrations in this repository.

## Implemented

| Layer | Technology | Use |
| --- | --- | --- |
| Frontend | React 18.3.1 and React DOM 18.3.1 | Single-page UI written in JavaScript and JSX. |
| Routing | React Router DOM 7.18.5 | Public pages and role-specific client routes. |
| Build and local server | Vite 6.4.5 | Development server, production bundle, and preview. |
| Styling | Plain CSS with custom properties | Public pages, auth screens, and staff workspace styles. |
| Fonts and icons | Google Fonts: Montserrat, Playfair Display, Material Symbols Outlined | Loaded from Google in `frontend/index.html`. |
| Auth client | Browser `fetch` and React Context | Calls the expected auth API and holds the current user in memory. |
| Staff demo data | React Context, seed data, and browser `localStorage` | Local demonstration records; no shared server persistence. |
| Package management | npm with `frontend/package-lock.json` | Reproducible dependency installation. |

The versions above are resolved versions from the lockfile. The version ranges declared in `frontend/package.json` are `^18.3.1` for React and React DOM, `^7.18.5` for React Router DOM, and `^6.3.5` for Vite. A Node.js version is not pinned in this repository.

## Application layout

- `frontend/src/main.jsx` mounts the app with `BrowserRouter`, `AuthProvider`, and `StaffDataProvider`.
- `frontend/src/app/App.jsx` defines public routes (`/`, `/login`, `/signup`) and client-side guards for `/account`, `/admin`, and `/staff/*`.
- `frontend/src/features/public/` contains the landing page and public styling.
- `frontend/src/features/auth/` contains the signup and login forms, auth context, and API client.
- `frontend/src/features/staff/` contains the staff dashboard, customer, query, quotation, and admin-contact views.
- `frontend/src/features/dashboard/RoleHome.jsx` supplies placeholder user and admin destinations.
- `frontend/src/shared/` contains shared staff UI components and design tokens.

## Authentication boundary

Public signup sends only name, email, and password. The login form offers User, Staff, and Admin; staff and admin also enter an organization-issued special ID. The frontend calls `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, and `/api/auth/logout` through `fetch` with `credentials: include`. The backend origin comes from `VITE_API_BASE_URL` (see `frontend/.env.example`).

These endpoints are **a required interface, not an implemented backend**. The server must assign the user role at registration, provision staff/admin accounts and IDs, verify credentials and roles, issue sessions, and enforce authorization on every protected API. Client route guards do not provide server security. The detailed request and response contract is in `frontend/README.md`.

## Build and deployment

From `frontend/`, run `npm ci`, `npm run dev`, or `npm run build`. The production bundle is written to `frontend/dist/`, which is ignored by Git. A deployment host must route unknown application paths to `frontend/index.html` for React Router to handle them. No hosting provider or deployment pipeline is configured in this repository.

## Not implemented in this repository

- Authentication server, database, or persistent customer/subscription API.
- Odoo or payment-provider integration. Odoo appears in research and requirements only.
- Production user and admin dashboards; both are destination shells.
- Automated tests, linting, TypeScript, CI workflows, or a pinned Node.js runtime.

The staff workspace still uses browser-local demonstration data. The frontend builds, but signup and sign-in cannot complete until a compatible backend is connected.
