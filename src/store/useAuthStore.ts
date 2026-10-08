import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole =
  | 'platform_admin'
  | 'super_admin'
  | 'tenant_admin'
  | 'tenant_member'
  | 'tenant_user'
  | 'tenant_viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  tenantId?: string;
  tenantName?: string;
  tenantSlug?: string;
}

export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  tokenType?: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens;
  activeTenant: string;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User | null) => void;
  updateUser: (partial: Partial<User>) => void;
  setActiveTenant: (tenantName: string) => void;
  setHasHydrated: (state: boolean) => void;
  logout: () => void;
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: {
        accessToken: null,
        refreshToken: null,
        tokenType: 'bearer',
      },
      activeTenant: 'Acme Corp',
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user, tokens) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('mw_user', JSON.stringify(user));
          if (tokens.accessToken) {
            setCookie('mw_token', tokens.accessToken);
          }
          setCookie('mw_role', user.role);
          if (user.tenantSlug) {
            setCookie('mw_tenant', user.tenantSlug);
          }
        }
        set({
          user,
          tokens,
          activeTenant: user.tenantName || get().activeTenant || 'Acme Corp',
          isAuthenticated: true,
        });
      },

      setTokens: (tokens) =>
        set((state) => {
          if (typeof window !== 'undefined' && tokens.accessToken) {
            setCookie('mw_token', tokens.accessToken);
          }
          return {
            tokens: { ...state.tokens, ...tokens },
          };
        }),

      setUser: (user) => {
        if (typeof window !== 'undefined') {
          if (user) {
            localStorage.setItem('mw_user', JSON.stringify(user));
            setCookie('mw_role', user.role);
          } else {
            localStorage.removeItem('mw_user');
            removeCookie('mw_token');
            removeCookie('mw_role');
            removeCookie('mw_tenant');
          }
        }
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      updateUser: (partial) => {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, ...partial };
        if (typeof window !== 'undefined') {
          localStorage.setItem('mw_user', JSON.stringify(updated));
        }
        set({ user: updated });
      },

      setActiveTenant: (tenantName) => set({ activeTenant: tenantName }),

      setHasHydrated: (state) => set({ hasHydrated: state }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mw_user');
          removeCookie('mw_token');
          removeCookie('mw_role');
          removeCookie('mw_tenant');
        }
        set({
          user: null,
          tokens: {
            accessToken: null,
            refreshToken: null,
          },
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'mw_auth_storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
