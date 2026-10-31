# Recurly Customer Portal — Continuation

Updated 31 October 2026.

## Completed in the review copy

- Dashboard restructured using the supplied Stitch subscriber profile: member banner, plan and masked payment cards, account updates, membership activity, and full-width invoice ledger.
- Customer-only navigation; removed the decorative Admin/Staff role display.
- Kept the background #F7FAF8 and shared typography/palette.
- Responsive desktop and 390px mobile dashboard inspected in the browser; mobile navigation and annual plan pricing verified.
- Added a shared accessible modal with focus entry/trapping/restoration, Escape dismissal, background scroll lock, and busy-state dismissal protection. Applied to confirmations and invoice details.
- Cleared stale coupons and quotes when inputs change; ignored stale quote responses; protected controls during review; unknown checkout result states no longer claim success.
- Added whitespace validation for profile names and support drafts, plus a skip-to-content link and reduced-motion support.

## Verification

Production build passed; npm audit found zero vulnerabilities. All 13 customer pages opened. Verified support draft creation, profile persistence/reload, notification read, invoice-download error, backend-required final pricing/cancellation error, coupon eligibility/invalidation, dialog keyboard handling, mobile menu, and annual pricing. Browser error log was empty during these checks.

## Still requires backend integration

Authentication, server-side customer ownership, real taxes/proration, successful purchases/payments, secure payment-provider redirects, and actual lifecycle updates. The original PRD and full customer prompt were not found in the available folders; the prior staged implementation and handoff served as the working scope. No production readiness claim is made.

## Delivery

Work was performed in a review copy under the Codex chat because write access to D:\staff\recurly-customer-workspace and D:\customer was not initially granted. The source archive excludes node_modules, dist, and .git. Extract it into the destination, then run npm install and npm run dev. See integration/setup-instructions.md and integration/mock-data.md.

Admin and Staff portals were not modified. No GitHub push was performed. Installation into D:\customer must be verified separately; this file does not claim it has happened.
