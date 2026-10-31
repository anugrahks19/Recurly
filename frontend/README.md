# Recurly frontend

One React/Vite app contains the landing page, login, signup, password reset, customer portal, staff workspace, and admin workspace.

## Run

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

The Vite server proxies `/api` to the backend at `127.0.0.1:3001`. Build with `npm.cmd run build`. In production, serve `index.html` for client routes and configure `VITE_API_BASE_URL` if the API uses a different origin. The backend must set `FRONTEND_ORIGIN` to the exact frontend origin.

Public signup creates user accounts only. Staff and admins select their role at login and provide their issued special ID. The backend enforces roles and customer ownership. Demo data in `src/features/customer/services/mockData.js` is available only if `VITE_DEMO_MODE=true`; the default frontend uses the SQL backed API.

See the project [README](../README.md) and [tech stack](../techstack.md) for backend setup and current external service requirements.
