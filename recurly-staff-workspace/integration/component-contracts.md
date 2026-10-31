# Shared component contracts

These exports are in `src/shared/components/Ui.jsx` and should be consolidated with the other developers' common components.

```jsx
<StatCard title="Customers" value={120} trend="12 active" icon="group" eyebrow="Portfolio" />
<StatusBadge status="Active" />
<DataTable columns={[{ key: 'name', label: 'Name' }]} data={[{ id: '1', name: 'A' }]} />
```

- `StatCard`: `title`, `value`, `trend`, `icon`, `eyebrow`. `icon` is a Material Symbols name.
- `StatusBadge`: `status` string. Current styled values: Active, Past Due, Paused, Open, In Progress, Resolved, Draft, Pending, Expired.
- `DataTable`: `columns` array of `{ key, label, render? }`, `data` array of objects, optional `emptyMessage`. `render(row)` returns a React node. Stable `row.id` is preferred.
- `PageHeader`: `eyebrow`, `title`, `description`, optional `action` React node.
- `Icon`: `name`, optional `className`.
- `EmptyState`: `icon`, `title`, `text`.

Role-specific `StaffLayout` wraps an `<Outlet />` and provides staff navigation. The unified app can keep it under `/staff/*` while using its own global header if desired, provided the Stitch visual pattern stays consistent.
