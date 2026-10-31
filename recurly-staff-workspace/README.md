# Recurly Staff Workspace

Developer 2's independent React workspace. It implements only the staff portal, based on the supplied Stitch `stitch_minimal_subscription_manager_portal` reference.

## Run

```powershell
cd recurly-staff-workspace
npm install
npm run dev
```

On Windows PowerShell with script execution disabled, use `npm.cmd` instead of `npm`. Open the URL printed by Vite. The workspace redirects `/` to `/staff/dashboard`. Run `npm run build` to verify the production bundle.

## Current scope

Home, Manage Customer, Discounts & Query, New Quotation, and Reach Admin. All records are clearly labeled demonstration data saved in browser `localStorage`. No backend delivery, authentication, or server authorization is implemented in this standalone workspace. The unified application must supply those services.

See `integration/` for the exact handover contract.
