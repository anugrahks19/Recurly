# Integration notes

## Implemented

- `/staff/dashboard`: operational metrics, customer ledger, and priority links.
- `/staff/customers`: search, status filter, add and edit customer records.
- `/staff/discounts-queries`: discount lookup, query creation, and status updates.
- `/staff/quotations`: live monthly estimate and saved quotation drafts.
- `/staff/reach-admin`: admin request form and local request history.

## Move into the unified frontend

| Workspace source | Final destination |
| --- | --- |
| `src/features/staff/pages/*` | `frontend/src/features/staff/pages/` |
| `src/features/staff/components/StaffLayout.jsx` | `frontend/src/features/staff/components/StaffLayout.jsx` |
| `src/features/staff/components/StaffDataProvider.jsx` | Temporary staff mock adapter, replace with shared API hooks |
| `src/features/staff/components/mockData.js` | Development fixture only |
| `src/features/staff/routes/StaffRoutes.jsx` | Merge declarations into `frontend/src/routes/` |
| `src/shared/components/Ui.jsx` | Consolidate interfaces into `frontend/src/components/common/` |
| `src/shared/styles/tokens.css` | `frontend/src/styles/tokens.css` after comparing with other roles |
| `src/shared/styles/global.css` | Merge into `frontend/src/styles/`, retain staff selectors as needed |

Do not move `src/index.jsx` or this workspace's `index.html` into the unified app. The unified app owns one React entry point, router, auth context, theme, and API layer.

This workspace currently uses relative imports from `shared/`; adjust those imports when common components and styles are consolidated. Preserve the exported component contracts in `component-contracts.md`.

## API boundary

The staff pages currently call `useStaffData()`. Replace that adapter with shared API hooks. Backend authorization must scope every read and mutation to the signed-in staff member's permitted records. A protected frontend route only controls navigation.
