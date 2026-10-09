import { useAuthStore } from '@/store/useAuthStore';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // When running in browser on a production domain, never allow requests to hit localhost
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const envUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
      if (envUrl && !envUrl.includes('localhost')) {
        return envUrl;
      }
      return '';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';
}

export interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: string | Array<{ msg: string; loc: string[] }>;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  data?: unknown;

  constructor(status: number, message: string, code: string = 'API_ERROR', data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Universal HTTP client with automatic JWT token attachment, 401 refresh flow,
 * and unified error extraction.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...customConfig } = options;

  const apiBase = getApiBaseUrl();
  let url = endpoint.startsWith('http')
    ? endpoint
    : `${apiBase}${apiBase && !endpoint.startsWith('/') ? '/' : ''}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const isFormData = typeof FormData !== 'undefined' && customConfig.body instanceof FormData;
  const reqHeaders: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = useAuthStore.getState().tokens.accessToken;
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized for token refresh
    if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      const { tokens, setTokens, logout } = useAuthStore.getState();

      if (tokens.refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const refreshRes = await fetch(`${apiBase}/api/v1/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: tokens.refreshToken }),
            });

            if (!refreshRes.ok) {
              throw new Error('Refresh token invalid or expired');
            }

            const refreshData = await refreshRes.json();
            setTokens({
              accessToken: refreshData.access_token,
              refreshToken: refreshData.refresh_token,
            });

            processQueue(null, refreshData.access_token);
            isRefreshing = false;

            // Retry original request with new token
            reqHeaders['Authorization'] = `Bearer ${refreshData.access_token}`;
            const retryRes = await fetch(url, { ...customConfig, headers: reqHeaders });
            return await handleResponse<T>(retryRes);
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            isRefreshing = false;
            logout();
            throw new ApiError(401, 'Session expired. Please log in again.', 'SESSION_EXPIRED');
          }
        } else {
          // Wait for pending refresh to finish
          return new Promise<T>((resolve, reject) => {
            failedQueue.push({
              resolve: async (newToken) => {
                reqHeaders['Authorization'] = `Bearer ${newToken}`;
                try {
                  const retryRes = await fetch(url, { ...customConfig, headers: reqHeaders });
                  resolve(await handleResponse<T>(retryRes));
                } catch (e) {
                  reject(e);
                }
              },
              reject: (err) => reject(err),
            });
          });
        }
      }
    }

    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, (error as Error).message || 'Network request failed');
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    let errorCode = 'HTTP_ERROR';
    let errorData: unknown = null;

    if (isJson) {
      try {
        errorData = await response.json();
        const errObj = errorData as {
          error?: { message?: string; code?: string };
          detail?: string | Array<{ msg?: string }>;
          message?: string;
        };

        if (errObj.error?.message) {
          errorMessage = errObj.error.message;
          errorCode = errObj.error.code || errorCode;
        } else if (errObj.detail) {
          if (Array.isArray(errObj.detail)) {
            errorMessage = errObj.detail.map((d) => d.msg || '').filter(Boolean).join(', ');
          } else {
            errorMessage = String(errObj.detail);
          }
        } else if (errObj.message) {
          errorMessage = errObj.message;
        }
      } catch {
        // failed to parse JSON error body
      }
    }

    throw new ApiError(response.status, errorMessage, errorCode, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return isJson ? await response.json() : ((await response.text()) as unknown as T);
}
