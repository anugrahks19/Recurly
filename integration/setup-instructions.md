# Setup and verification

1. Install a Node.js version supported by Vite 6 and run `npm install` in `recurly-customer-workspace`.
2. Run `npm run dev`; open the printed local URL and navigate to `/customer/dashboard`.
3. Review the thirteen customer routes from `integration/routes.md`, including the mobile menu.
4. In demo mode, browse plans, apply `WELCOME10` to Studio or Atelier, inspect an existing subscription, and save a profile edit or support draft. Reload to verify local demo persistence.
5. Try final pricing, an invoice download, or a plan change. The UI must explain that the backend is required, with no success claim.
6. Run `npm run build` and `npm audit --audit-level=moderate`.

For real integration, configure `VITE_API_BASE_URL`, shared authentication, protected customer routing, and the API contract above. Test successful and failed payments against a safe backend test environment and confirm that one customer cannot read another customer's records.

## Continuation verification — 31 October 2026

- Production build passed; dependency audit reported zero vulnerabilities.
- All 13 customer pages opened in the local browser without account-error views.
- Desktop dashboard visually compared with the Stitch subscriber profile: member banner, plan/payment columns, updates/activity cards, and full-width invoice ledger.
- Verified local support draft creation, coupon eligibility and invalidation, and backend-required errors for final pricing and cancellation.
- Verified dialog focus entry, Tab navigation, Escape dismissal, and focus restoration.
- Real authentication, customer ownership, successful payments, tax/proration results, and lifecycle updates still require backend integration tests.
- Source was prepared in a writable review copy because access to the original D: folders was not granted. See CODEX_CONTINUATION.md for delivery status.

Additional browser checks passed: 390px mobile layout and menu, annual pricing, profile persistence after reload, notification reads, invoice download error handling, and invoice dialog Escape. Browser console errors: none observed.
