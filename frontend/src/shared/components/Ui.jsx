import React from 'react';

export function Icon({ name, className = '' }) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export function StatCard({ title, value, trend, icon, eyebrow }) {
  return <article className="stat-card card">
    <div className="stat-top"><div><span className="eyebrow">{eyebrow}</span><h3>{title}</h3></div><span className="icon-box"><Icon name={icon} /></span></div>
    <div><strong className="stat-value">{value}</strong><p className="stat-trend">{trend}</p></div>
  </article>;
}

export function StatusBadge({ status }) {
  const key = String(status).toLowerCase().replaceAll(' ', '-');
  return <span className={`status status-${key}`}><i />{status}</span>;
}

export function DataTable({ columns, data, emptyMessage = 'No records found.' }) {
  return <div className="table-scroll"><table><thead><tr>{columns.map(column => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>
    {data.length ? data.map((row, index) => <tr key={row.id ?? index}>{columns.map(column => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>) : <tr><td colSpan={columns.length} className="empty-cell">{emptyMessage}</td></tr>}
  </tbody></table></div>;
}

export function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header"><div><span className="eyebrow context-label"><span className="dot" />{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <div className="header-action">{action}</div>}</div>;
}

export function EmptyState({ icon, title, text }) {
  return <div className="empty-state"><Icon name={icon} /><h3>{title}</h3><p>{text}</p></div>;
}
