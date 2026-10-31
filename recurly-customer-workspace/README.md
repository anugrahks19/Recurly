# Recurly Customer Portal

Developer 3's independent customer workspace. It uses the same Stitch palette, Playfair Display headings, Montserrat UI text, top navigation, and common component contracts as the staff workspace.

## Run

```powershell
cd recurly-customer-workspace
npm install
npm run dev
```

On Windows PowerShell with script execution disabled, use `npm.cmd`. Open the local URL printed by Vite. `/` redirects to `/customer/dashboard`.

## Demo mode and real operations

With no `VITE_API_BASE_URL`, the portal displays illustrative customer data. Profile edits, notification reads, and support drafts are saved only in this browser. Subscription purchase, plan changes, cancellation, invoice downloads, and payment method changes require the customer backend API and report that no real operation occurred when it is absent. No raw card fields exist in the frontend.

Set `VITE_API_BASE_URL` to the backend origin to use the documented API contract in `integration/mock-data.md`. The final application supplies the real authentication context and protected routes. See `integration/` for handover details.
