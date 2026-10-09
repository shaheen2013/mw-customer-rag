import { apiClient } from '@/lib/api-client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

/**
 * Resolves avatar URL, converting legacy /static/ paths to /api/v1/static/
 * and prepending the backend base URL.
 */
export function resolveAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Convert legacy /static/ paths to /api/v1/static/
  const normalizedPath = url.startsWith('/static/')
    ? `/api/v1${url}`
    : url.startsWith('static/')
    ? `/api/v1/${url}`
    : url.startsWith('/')
    ? url
    : `/${url}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  email: string;
  user_id: string;
}

export interface TenantLoginPayload {
  email: string;
  password: string;
  tenant_slug?: string;
}

export interface TenantAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  email: string;
  user_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
}

export interface TenantRegisterPayload {
  name: string;
  email: string;
  password: string;
  slug?: string;
  admin_name?: string;
}

export interface UniversalLoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface OTPRequestPayload {
  email: string;
}

export interface OTPVerifyPayload {
  email: string;
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  reset_token: string;
  new_password: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  role: string;
  tenant_id: string | null;
  tenant_name: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserProfileUpdatePayload {
  name?: string;
  phone_number?: string;
  avatar_url?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export const authApi = {
  /**
   * Authenticate Platform Super Admin.
   */
  loginAdmin: async (data: AdminLoginPayload): Promise<AdminAuthResponse> => {
    return apiClient<AdminAuthResponse>('/api/v1/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * Authenticate Tenant User / Admin within isolated workspace.
   */
  loginTenant: async (data: TenantLoginPayload): Promise<TenantAuthResponse> => {
    return apiClient<TenantAuthResponse>('/api/v1/auth/tenant/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * Register new Tenant Organization and create initial Tenant Admin.
   */
  registerTenant: async (data: TenantRegisterPayload): Promise<TenantAuthResponse> => {
    return apiClient<TenantAuthResponse>('/api/v1/auth/tenant/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * Universal password login.
   */
  loginUniversal: async (data: UniversalLoginPayload): Promise<TokenResponse> => {
    return apiClient<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * Request email OTP code.
   */
  requestOtp: async (data: OTPRequestPayload): Promise<{ status: string; message: string; dev_otp?: string }> => {
    return apiClient('/api/v1/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * Verify email OTP code and obtain token pair.
   */
  verifyOtp: async (data: OTPVerifyPayload): Promise<TokenResponse> => {
    return apiClient<TokenResponse>('/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * Request password reset token email.
   */
  forgotPassword: async (data: ForgotPasswordPayload): Promise<{ status: string; message: string }> => {
    return apiClient('/api/v1/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * Reset account password with token.
   */
  resetPassword: async (data: ResetPasswordPayload): Promise<{ status: string; message: string }> => {
    return apiClient('/api/v1/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  /**
   * Fetch current user's profile details.
   */
  getProfile: async (): Promise<UserProfileResponse> => {
    return apiClient<UserProfileResponse>('/api/v1/users/me');
  },

  /**
   * Update personal profile fields (name, phone number, avatar URL, email).
   */
  updateProfile: async (data: UserProfileUpdatePayload): Promise<UserProfileResponse> => {
    return apiClient<UserProfileResponse>('/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload user profile avatar image (.png, .jpg, .jpeg, .webp, .svg, .gif <= 5MB).
   */
  uploadAvatar: async (file: File): Promise<{ status: string; message: string; avatar_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<{ status: string; message: string; avatar_url: string }>('/api/v1/users/me/avatar', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Change account password after verifying current password.
   */
  changePassword: async (data: ChangePasswordPayload): Promise<{ status: string; message: string }> => {
    return apiClient<{ status: string; message: string }>('/api/v1/users/me/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout user session.
   */
  logout: async (): Promise<{ status: string; message: string }> => {
    return apiClient('/api/v1/auth/logout', {
      method: 'POST',
    });
  },
};
