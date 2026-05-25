import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.me();
      if (data.authenticated === false) {
        setToken(null);
        setUser(null);
      } else {
        setUser(data);
      }
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    const { token, ...userData } = data;
    if (token) setToken(token);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
