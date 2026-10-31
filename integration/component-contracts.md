# Component contracts

The current page keeps `MetricCard` and `Status` local to `Dashboard.jsx`. For shared consolidation, use these interfaces:

```jsx
<StatCard title="Active subscriptions" value={7} trend="Current active records" />
<StatusBadge status="Active" />
<DataTable columns={columns} data={rows} />
```

All common components should use the established light palette, local fonts, 44px interactive targets, and visible focus states. `Icon` uses Material Symbols Outlined names. The ledger has a semantic desktop table and ordered mobile row summaries.
