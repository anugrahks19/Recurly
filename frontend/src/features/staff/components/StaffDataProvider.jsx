import React, { createContext, useContext, useEffect, useState } from 'react';

const StaffDataContext = createContext(null);
const base = import.meta.env.VITE_API_BASE_URL || '';
const empty = { customers: [], plans: [], discounts: [], queries: [], quotations: [], adminMessages: [] };
async function request(path, options) {
  const response = await fetch(`${base}/api/staff${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

export function StaffDataProvider({ children }) {
  const [data, setData] = useState(empty);
  const [error, setError] = useState('');
  const refresh = async () => { try { setData(await request('/workspace')); setError(''); } catch (err) { setError(err.message); } };
  useEffect(() => { refresh(); }, []);
  async function update(collection, item) {
    const paths = { customers: 'customers', queries: 'queries', quotations: 'quotations', adminMessages: 'admin-messages' };
    if (!paths[collection]) throw new Error('This record cannot be changed here.');
    const existing = collection === 'customers' || collection === 'queries' ? data[collection].some(row => row.id === item.id) : false;
    const path = existing ? `/${paths[collection]}/${item.id}` : `/${paths[collection]}`;
    const method = existing ? 'PATCH' : 'POST';
    try { await request(path, { method, body: JSON.stringify(item) }); await refresh(); }
    catch (err) { setError(err.message); throw err; }
  }
  return <StaffDataContext.Provider value={{ ...data, error, update, refresh }}>{children}</StaffDataContext.Provider>;
}

export function useStaffData() {
  const value = useContext(StaffDataContext);
  if (!value) throw new Error('useStaffData must be inside StaffDataProvider');
  return value;
}

