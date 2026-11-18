import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';

export interface UserType {
  _id?: string;
  name?: string;
  email?: string;
  token?: string;
  avatar?: string;
  authProvider?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password?: string) => Promise<any>;
  signup: (name: string, email: string, password?: string) => Promise<any>;
  register: (name: string, email: string, password?: string) => Promise<any>;
  googleLogin: (credential: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Helper: safe JSON parse ───────────────────────────────────────────────────
const safeParseUser = (): any => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ── Re-hydrate session from localStorage on mount ─────────────────────────
  useEffect(() => {
    const storedUser = safeParseUser();
    if (storedUser?.token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // ── Persist user to localStorage whenever it changes ─────────────────────
  const persistUser = (userData: any) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  // ── Auth actions ─────────────────────────────────────────────────────────
  const login = async (email: string, password?: string): Promise<any> => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    persistUser(data);
    return data;
  };

  const signup = async (name: string, email: string, password?: string): Promise<any> => {
    const { data } = await axiosInstance.post('/auth/signup', { name, email, password });
    persistUser(data);
    return data;
  };

  // Alias: some components call register
  const register = signup;

  const googleLogin = async (credential: string): Promise<any> => {
    const { data } = await axiosInstance.post('/auth/google', { credential });
    persistUser(data);
    return data;
  };

  const logout = useCallback(() => {
    persistUser(null);
  }, []);

  // ── Token verification on window focus ───────────────────────────────────
  useEffect(() => {
    const handleFocus = async () => {
      const storedUser = safeParseUser();
      if (!storedUser?.token) return;
      try {
        // Silently verify token is still valid
        await axiosInstance.get('/auth/me');
      } catch (err: any) {
        if (err?.response?.status === 401) {
          // Token expired — clear session
          persistUser(null);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, register, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
