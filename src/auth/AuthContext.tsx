import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface User {
  email: string;
  name: string;
}

interface AuthResult {
  ok: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loginWithGoogle: (credential: string) => boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, name?: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'leetcode-dashboard-auth';

function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join('')
  );
  return JSON.parse(payload);
}

const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.PROD ? "" : 'http://localhost:4000');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const loginWithGoogle = (credential: string) => {
    try {
      const payload = parseJwt(credential) as {
        email?: string;
        name?: string;
      };

      if (!payload?.email) {
        return false;
      }

      setUser({
        email: payload.email,
        name: payload.name || payload.email,
      });

      return true;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, message: data.message || 'Login failed' };
    }

    setUser({ email: data.user.email, name: data.user.name });
    window.localStorage.setItem('leetcode-dashboard-token', data.token);

    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Network error' };
  }
};

  const register = async (email: string, password: string, name?: string): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: data.message || 'Registration failed' };
      }
      setUser({ email: data.user.email, name: data.user.name });
      window.localStorage.setItem('leetcode-dashboard-token', data.token);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Network error' };
    }
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({ user, loginWithGoogle, login, register, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
