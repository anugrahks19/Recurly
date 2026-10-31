import React, { createContext, useContext, useEffect, useState } from 'react';
import { seedData } from './mockData.js';

const StaffDataContext = createContext(null);
const STORAGE_KEY = 'recurly-staff-demo-v1';

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && Array.isArray(stored.customers) && Array.isArray(stored.queries)) return stored;
  } catch { /* A damaged demo store is replaced with seed data. */ }
  return seedData;
}

export function StaffDataProvider({ children }) {
  const [data, setData] = useState(loadData);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);
  function update(collection, item) {
    setData(previous => ({ ...previous, [collection]: previous[collection].some(entry => entry.id === item.id)
      ? previous[collection].map(entry => entry.id === item.id ? item : entry)
      : [item, ...previous[collection]] }));
  }
  return <StaffDataContext.Provider value={{ ...data, update }}>{children}</StaffDataContext.Provider>;
}

export function useStaffData() {
  const value = useContext(StaffDataContext);
  if (!value) throw new Error('useStaffData must be inside StaffDataProvider');
  return value;
}

export const makeId = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
