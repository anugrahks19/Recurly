# Recurly

Subscription management project with one frontend app in [`frontend`](frontend/). It contains the landing page, user signup, role-aware login, and the staff workspace. Project research and requirements remain in `docs/` and `research/`.

## Start the frontend

```powershell
cd frontend
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

See [`frontend/README.md`](frontend/README.md) for the backend authentication contract and production build instructions.
