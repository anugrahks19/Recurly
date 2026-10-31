# Dependencies

Runtime: `react`, `react-dom`, `react-router-dom` 7.18.5 or a compatible version agreed for the unified frontend. Development: `vite` 6.4.5. Exact resolved versions are in `package-lock.json`.

External visual resources loaded from Google Fonts: Playfair Display, Montserrat, Material Symbols Outlined. CSS includes system font fallbacks, though Material Symbols icons require the font or a replacement icon set.

No charting, UI framework, or backend SDK dependency is introduced. The supplied Stitch HTML uses Tailwind via CDN; this workspace uses plain CSS with the same tokens, so Tailwind is not required.

No environment variables are needed for the local demo. The unified API adapter will likely need its shared API base URL and authentication configuration, owned by the unified application.
