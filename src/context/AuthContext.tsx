'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'super_admin' | 'tenant_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole, tenantName?: string) => void;
  logout: () => void;
  activeTenant: string;
  setActiveTenant: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mw_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    // Default logged in as Super Admin for direct access matching PDF
    return {
      id: '1',
      email: 'admin@mediusware.ai',
      name: 'Super Admin',
      role: 'super_admin',
      tenantName: 'Acme Corp',
    };
  });

  const [activeTenant, setActiveTenant] = useState<string>('Acme Corp');

  useEffect(() => {
    if (user) {
      localStorage.setItem('mw_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mw_user');
    }
  }, [user]);

  const login = (email: string, role: UserRole, tenantName: string = 'Acme Corp') => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: role === 'super_admin' ? 'Super Admin' : `${tenantName} Admin`,
      role,
      tenantName,
    };
    setUser(newUser);
    if (tenantName) setActiveTenant(tenantName);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, activeTenant, setActiveTenant }}>
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
