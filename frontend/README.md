# Recurly frontend

Single Vite/React app for the public landing page, user registration, role-aware sign in, and staff workspace.

## Run

```powershell
cd D:\Recurly\Recurly-frontend\frontend
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Set `VITE_API_BASE_URL` in `.env.local` to the backend origin. Use `npm.cmd run build` for the production bundle. The web host must serve `index.html` for unknown app paths, including `/login`, `/signup`, `/account`, `/admin`, and `/staff/*`.

## Structure

- `src/app`: shared routes and client-side role gates
- `src/features/public`: landing page and public styling
- `src/features/auth`: forms, session state, and auth API client
- `src/features/staff`: existing staff workspace and local demonstration records
- `src/features/dashboard`: user and admin destination shells
- `src/shared`: staff UI primitives and design tokens

## Required backend contract

The frontend uses cookie-based sessions and sends `credentials: include`.

| Method | Path | Request | Response |
| --- | --- | --- | --- |
| GET | `/api/auth/me` | — | `{ "user": { "id", "name", "email", "role" } }` or 401 |
| POST | `/api/auth/register` | `{ "name", "email", "password" }` | 201 or 200 |
| POST | `/api/auth/login` | `{ "email", "password", "role", "specialId"? }` | `{ "user": { "id", "name", "email", "role" } }` and session cookie |
| POST | `/api/auth/logout` | — | 200/204 and cleared cookie |

The server must always assign `user` on public registration. It must never accept a client-supplied role for registration. Admin and staff accounts and their special IDs must be provisioned by an authorized administrator. For staff and admin login, verify the special ID on the server, along with the password and selected role. Reject mismatched roles and invalid IDs. Protect every API endpoint by the authenticated server-side role; frontend route checks are only navigation guards. Use hashed passwords, rate limits, secure HttpOnly SameSite cookies, and CSRF protection appropriate to the deployment. If the API uses a different origin, configure credentialed CORS for the exact frontend origin.

No backend exists in this repository yet. Until these endpoints are implemented, signup and login correctly report API errors rather than pretending to authenticate. The staff workspace still uses local browser demo data; user and admin destination pages are shells awaiting their domain APIs.
