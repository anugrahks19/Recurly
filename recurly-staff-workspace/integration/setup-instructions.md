# Setup and verification

1. Install Node.js 20.19+ or 22.12+.
2. From `recurly-staff-workspace`, run `npm install` (on this machine use `npm.cmd` from PowerShell).
3. Run `npm run dev` and open the printed local URL.
4. Check all five staff routes from the header. On a narrow screen, use the menu button.
5. Add or edit a customer, create a query, check `WELCOME10`, save a draft quotation, and save an admin request. Reload to confirm browser-local persistence.
6. Run `npm run build` before integration.

To reset demo records, remove the `recurly-staff-demo-v1` key from browser localStorage and reload.

Verified in this workspace on 2026-10-31: `npm.cmd run build` passed, and `npm.cmd audit --audit-level=moderate` reported zero vulnerabilities. A live backend, cross-user synchronization, and browser delivery of admin requests are pending integration.
