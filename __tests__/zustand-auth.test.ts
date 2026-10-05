import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/useAuthStore';

describe('Zustand useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('initializes with logged-out state after logout', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets authentication state and persists tokens', () => {
    const mockUser = {
      id: 'user-123',
      email: 'member@acme.com',
      name: 'Acme Member',
      role: 'tenant_member' as const,
      tenantId: 'tenant-1',
      tenantName: 'Acme Corp',
      tenantSlug: 'acme-corp',
    };

    const mockTokens = {
      accessToken: 'access-jwt-123',
      refreshToken: 'refresh-jwt-456',
      tokenType: 'bearer',
    };

    useAuthStore.getState().setAuth(mockUser, mockTokens);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.tokens.accessToken).toBe('access-jwt-123');
    expect(state.tokens.refreshToken).toBe('refresh-jwt-456');
    expect(state.activeTenant).toBe('Acme Corp');
  });

  it('clears state on logout', () => {
    useAuthStore.getState().setAuth(
      {
        id: 'admin-1',
        email: 'admin@mediusware.ai',
        name: 'Super Admin',
        role: 'platform_admin',
      },
      {
        accessToken: 'token-abc',
        refreshToken: 'refresh-abc',
      }
    );

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.tokens.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
