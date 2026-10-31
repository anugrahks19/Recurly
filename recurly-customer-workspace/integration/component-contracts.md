# Component contracts

Shared components copied from the staff contract live in `src/shared/components/Ui.jsx`:

```jsx
<StatCard title="Next Billing" value="$48" trend="12 Nov" icon="event" eyebrow="Next cycle" />
<StatusBadge status="Active" />
<DataTable columns={[{ key: 'name', label: 'Name', render: row => row.name }]} data={rows} />
```

`DataTable` accepts `columns`, `data`, and optional `emptyMessage`; `StatusBadge` accepts `status`; `PageHeader` accepts `eyebrow`, `title`, `description`, and optional `action`. `Icon` takes a Material Symbols name. Reconcile these copies into one set of common components during integration.

Customer-only components in `CustomerUi.jsx`: `Notice`, `LoadingView`, `ErrorView`, `ConfirmDialog`, `PlanCard`, and `SubscriptionSummary`. `ConfirmDialog` receives `title`, `description`, `confirmLabel`, `onConfirm`, `onClose`, optional `busy`, and optional `destructive`. It is used for purchase, plan changes, pause, resume, cancellation, and method removal.
