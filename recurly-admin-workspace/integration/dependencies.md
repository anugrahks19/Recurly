# Dependencies

- React and React DOM 19.
- Vite 7 for this independent development workspace.
- No chart, icon, router, or motion package is required. Material Symbols Outlined loads from Google Fonts in `index.html`; replace with the shared icon installation if the unified frontend provides one.
- Playfair Display and Montserrat are bundled locally under `src/shared/assets/fonts/` with their OFL license files.

The final app should use its single existing React, build, routing, icon, and service dependencies. Do not copy this workspace's package manifest over the common one.
