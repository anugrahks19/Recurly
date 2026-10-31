import React, { createContext, useContext, useEffect, useState } from 'react';
import { authRequest } from './api.js';

const AuthContext = createContext(null);
export const homeForRole = { admin: '/admin', staff: '/staff/dashboard', user: '/account' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authRequest('me').then(data => {
      if (active) setUser(data.user || null);
    }).catch(() => {
      if (active) setUser(null);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function login(credentials) {
    const data = await authRequest('login', { method: 'POST', body: JSON.stringify(credentials) });
    if (!data.user || !homeForRole[data.user.role] || data.user.role !== credentials.role) {
      throw new Error('This account does not have access to the selected workspace.');
    }
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await authRequest('logout', { method: 'POST' });
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
