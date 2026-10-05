'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  authApi,
  AdminLoginPayload,
  TenantLoginPayload,
  UniversalLoginPayload,
  OTPRequestPayload,
  OTPVerifyPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@/lib/api/auth';
import { useAuthStore, UserRole } from '@/store/useAuthStore';

export const AUTH_QUERY_KEYS = {
  me: ['auth', 'me'] as const,
  session: ['auth', 'session'] as const,
};

/**
 * Hook to authenticate Platform Super Admin.
 * Updates Zustand store with access/refresh tokens and routes to /admin.
 */
export function useAdminLoginMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: AdminLoginPayload) => authApi.loginAdmin(credentials),
    onSuccess: (data) => {
      setAuth(
        {
          id: data.user_id,
          email: data.email,
          name: 'Super Admin',
          role: (data.role as UserRole) || 'platform_admin',
          tenantName: 'Platform Admin Console',
        },
        {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenType: data.token_type,
        }
      );

      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      options?.onSuccess?.();
      router.push('/admin');
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to authenticate Tenant User or Admin within a multi-tenant workspace.
 * Updates Zustand store with tenant claims and routes to /dashboard.
 */
export function useTenantLoginMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: TenantLoginPayload) => authApi.loginTenant(credentials),
    onSuccess: (data) => {
      setAuth(
        {
          id: data.user_id,
          email: data.email,
          name: data.role === 'tenant_admin' ? `${data.tenant_name} Admin` : 'Team Member',
          role: (data.role as UserRole) || 'tenant_admin',
          tenantId: data.tenant_id,
          tenantName: data.tenant_name,
          tenantSlug: data.tenant_slug,
        },
        {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenType: data.token_type,
        }
      );

      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      options?.onSuccess?.();
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to register a new Tenant Organization & initial Admin.
 * Updates Zustand store and routes to /dashboard.
 */
export function useTenantRegisterMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      password: string;
      slug?: string;
      admin_name?: string;
    }) => authApi.registerTenant(payload),
    onSuccess: (data) => {
      setAuth(
        {
          id: data.user_id,
          email: data.email,
          name: `${data.tenant_name} Admin`,
          role: 'tenant_admin',
          tenantId: data.tenant_id,
          tenantName: data.tenant_name,
          tenantSlug: data.tenant_slug,
        },
        {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenType: data.token_type,
        }
      );

      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      options?.onSuccess?.();
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to authenticate via universal email/password.
 */
export function useUniversalLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: UniversalLoginPayload) => authApi.loginUniversal(credentials),
    onSuccess: (data, variables) => {
      setAuth(
        {
          id: 'user',
          email: variables.email,
          name: 'Workspace User',
          role: 'tenant_admin',
          tenantName: 'Acme Corp',
        },
        {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenType: data.token_type,
        }
      );
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
    },
  });
}

/**
 * Hook to request email OTP code.
 */
export function useRequestOtpMutation() {
  return useMutation({
    mutationFn: (data: OTPRequestPayload) => authApi.requestOtp(data),
  });
}

/**
 * Hook to verify email OTP code.
 */
export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: OTPVerifyPayload) => authApi.verifyOtp(data),
    onSuccess: (data, variables) => {
      setAuth(
        {
          id: 'user',
          email: variables.email,
          name: 'Work Email User',
          role: 'tenant_viewer',
        },
        {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenType: data.token_type,
        }
      );
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
    },
  });
}

/**
 * Hook for forgot password.
 */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (data: ForgotPasswordPayload) => authApi.forgotPassword(data),
  });
}

/**
 * Hook for password reset.
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: ResetPasswordPayload) => authApi.resetPassword(data),
  });
}

/**
 * Hook to logout session.
 * Clears Zustand auth store and invalidates TanStack Query cache.
 */
export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch (_) {
        // Continue client logout even if API call fails
      }
    },
    onSettled: () => {
      logout();
      queryClient.clear();
      router.push('/login');
    },
  });
}
