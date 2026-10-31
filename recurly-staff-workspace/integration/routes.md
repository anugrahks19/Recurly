# Routes

| Path | Page |
| --- | --- |
| `/staff/dashboard` | `StaffHome` |
| `/staff/customers` | `ManageCustomers` |
| `/staff/discounts-queries` | `DiscountsQueries` |
| `/staff/quotations` | `NewQuotation` |
| `/staff/reach-admin` | `ReachAdmin` |

`StaffRoutes.jsx` provides these routes for standalone development. During integration, register them as children of the unified `/staff` route, wrap that route in the shared `ProtectedRoute` for role `staff`, and use `StaffLayout` as its layout. Keep login and registration in the unified auth feature. Do not use the local role display pill as a role switcher or as authorization.

Suggested integration shape:

```jsx
<Route element={<ProtectedRoute allowedRoles={['staff']} />}>
  <Route path="staff" element={<StaffLayout />}>
    <Route path="dashboard" element={<StaffHome />} />
    <Route path="customers" element={<ManageCustomers />} />
    <Route path="discounts-queries" element={<DiscountsQueries />} />
    <Route path="quotations" element={<NewQuotation />} />
    <Route path="reach-admin" element={<ReachAdmin />} />
  </Route>
</Route>
```
