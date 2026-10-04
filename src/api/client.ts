/**
 * VoiceShield Console Central API Client
 * Connects directly to production backend at https://vs-console-server.onrender.com/api/v1
 */

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'https://vs-console-server.onrender.com/api/v1').replace(/\/+$/, '');

export const HEALTH_BASE_URL =
  (import.meta.env.VITE_HEALTH_BASE_URL || 'https://vs-console-server.onrender.com/health').replace(/\/+$/, '');

export interface ApiErrorDetail {
  field?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  code: string;
  details?: ApiErrorDetail[];
  requestId?: string;
  status: number;

  constructor(message: string, code = 'API_ERROR', status = 500, details?: ApiErrorDetail[], requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  requestId?: string;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'vs_console_access_token';
const REFRESH_TOKEN_KEY = 'vs_console_refresh_token';

function getStorage(): Storage | null {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }
  return globalThis.localStorage;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    const storage = getStorage();
    return storage ? storage.getItem(ACCESS_TOKEN_KEY) : null;
  },
  getRefreshToken(): string | null {
    const storage = getStorage();
    return storage ? storage.getItem(REFRESH_TOKEN_KEY) : null;
  },
  setTokens(accessToken: string, refreshToken?: string): void {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clearTokens(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Queue concurrent requests during token refresh to avoid stampedes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function performTokenRefresh(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.clearTokens();
    throw new ApiError('No refresh token available', 'SESSION_EXPIRED', 401);
  }

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.success || !body.data?.tokens?.accessToken) {
    tokenStorage.clearTokens();
    throw new ApiError(body.error?.message || 'Session expired. Please log in again.', body.error?.code || 'SESSION_EXPIRED', 401);
  }

  const newAccess = body.data.tokens.accessToken;
  const newRefresh = body.data.tokens.refreshToken;
  tokenStorage.setTokens(newAccess, newRefresh);
  return newAccess;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, skipAuth = false, headers: customHeaders, ...fetchOpts } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    if (qs) {
      url += `${url.includes('?') ? '&' : '?'}${qs}`;
    }
  }

  const headers = new Headers(customHeaders);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Set Authorization unless skipped
  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Auto set content-type for JSON if not FormData
  if (fetchOpts.body && !(fetchOpts.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOpts,
      headers,
    });
  } catch (netErr: unknown) {
    const msg = netErr instanceof Error ? netErr.message : 'Network error';
    throw new ApiError(`Unable to connect to backend server: ${msg}`, 'NETWORK_ERROR', 0);
  }

  // Handle 401 and Token Refresh
  if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAccessToken = await performTokenRefresh();
        isRefreshing = false;
        onRefreshed(newAccessToken);

        // Retry original request with new token
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        const retryRes = await fetch(url, { ...fetchOpts, headers });
        const retryData = await retryRes.json().catch(() => ({}));
        if (!retryRes.ok) {
          throw new ApiError(
            retryData.error?.message || `HTTP ${retryRes.status}`,
            retryData.error?.code || 'API_ERROR',
            retryRes.status,
            retryData.error?.details,
            retryData.requestId
          );
        }
        return retryData as ApiResponse<T>;
      } catch (refreshErr) {
        isRefreshing = false;
        refreshSubscribers = [];
        tokenStorage.clearTokens();
        // Dispatch session expired custom event so app shell can react
        if (typeof globalThis.dispatchEvent === 'function') {
          globalThis.dispatchEvent(new CustomEvent('vs-session-expired'));
        }
        throw refreshErr;
      }
    } else {
      // Another request is already refreshing tokens; await resolution
      return new Promise<ApiResponse<T>>((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          try {
            headers.set('Authorization', `Bearer ${newToken}`);
            const retryRes = await fetch(url, { ...fetchOpts, headers });
            const retryData = await retryRes.json().catch(() => ({}));
            if (!retryRes.ok) {
              reject(
                new ApiError(
                  retryData.error?.message || `HTTP ${retryRes.status}`,
                  retryData.error?.code || 'API_ERROR',
                  retryRes.status,
                  retryData.error?.details,
                  retryData.requestId
                )
              );
            } else {
              resolve(retryData as ApiResponse<T>);
            }
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorObj = json?.error || {};
    const message = errorObj.message || `Request failed with status ${response.status}`;
    const code = errorObj.code || `HTTP_${response.status}`;
    throw new ApiError(message, code, response.status, errorObj.details, json?.requestId);
  }

  return json as ApiResponse<T>;
}
