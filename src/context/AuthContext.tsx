'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore, User, UserRole } from '@/store/useAuthStore';

export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole, tenantName?: string) => void;
  logout: () => void;
  activeTenant: string;
  setActiveTenant: (name: string) => void;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const tokens = useAuthStore((state) => state.tokens);
  const activeTenant = useAuthStore((state) => state.activeTenant);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const setActiveTenant = useAuthStore((state) => state.setActiveTenant);
  const storeLogout = useAuthStore((state) => state.logout);

  // Sync from localStorage if present (for test isolation & immediate restore)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mw_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            setUser(parsed);
          }
        } catch {
          // ignore corrupted local storage
        }
      }
    }
  }, [setUser]);

  const login = (email: string, role: UserRole, tenantName: string = 'Acme Corp') => {
    const isSuper = role === 'super_admin' || role === 'platform_admin';
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: isSuper ? 'Super Admin' : `${tenantName} Admin`,
      role,
      tenantName,
    };
    setAuth(newUser, {
      accessToken: `mock-jwt-token-${Date.now()}`,
      refreshToken: `mock-refresh-token-${Date.now()}`,
    });
    if (tenantName) setActiveTenant(tenantName);
  };

  const logout = () => {
    storeLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        activeTenant,
        setActiveTenant,
        tokens,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
