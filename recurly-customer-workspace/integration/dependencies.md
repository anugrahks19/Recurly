# Dependencies and environment

Runtime: `react`, `react-dom`, `react-router-dom`. Development: `vite`. The lockfile records exact resolved versions. No UI framework, chart library, or payment SDK is added.

Fonts and icons are requested from Google Fonts in `index.html`: Playfair Display, Montserrat, and Material Symbols Outlined. For offline hosting, replace them with approved local font assets.

Environment variables:

- `VITE_API_BASE_URL`: backend origin, such as `https://api.example.com`. Omit for labeled demo mode. The service appends `/api/customer/me`.
- `VITE_PASSWORD_CHANGE_URL`: shared authentication flow URL for password changes. If missing, the UI explains that the auth flow is not connected.

The backend should use secure session cookies with `credentials: include` or adapt the shared request function to the team's auth mechanism. Never put secrets or raw card details in Vite environment variables or browser storage.
