# Mock data and required APIs

The seed fixture is `src/features/staff/components/mockData.js`. `StaffDataProvider` persists changes under `recurly-staff-demo-v1` in browser `localStorage`. It is a development adapter, not a multi-user store.

Replace with authorized API operations:

| Current collection | Required backend operations |
| --- | --- |
| `customers` | List assigned customers, get details, create or update permitted fields |
| `discounts` | List available codes, validate a code and its eligibility for a customer/plan |
| `queries` | List staff queries, create query, update status |
| `quotations` | Create draft, list drafts, calculate server-approved totals, submit for approval or delivery |
| `adminMessages` | Submit admin request, list requests and their real status |

Use server-generated IDs, timestamps, and prices. The current quote calculation uses illustrative Studio $24, Atelier $48, and Maison $120 monthly values from the Stitch example. The backend must own final pricing, taxes, discount eligibility, and delivery. The current quotation form deliberately saves a draft only; it does not claim to send anything. The admin request form saves locally and explicitly says it has not been delivered.

No mock credential, auth token, or staff permission is embedded.
