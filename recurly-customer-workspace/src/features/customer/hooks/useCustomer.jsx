import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { customerApi, isDemo } from '../services/customerApi.js';

const Context = createContext(null);
export function CustomerProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => { setLoading(true); setError(''); try { setData(await customerApi.load()); } catch (e) { setError(e.message); } finally { setLoading(false); } }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return <Context.Provider value={{ data, loading, error, refresh, isDemo }}>{children}</Context.Provider>;
}
export function useCustomer() { const value = useContext(Context); if (!value) throw new Error('useCustomer must be inside CustomerProvider'); return value; }
