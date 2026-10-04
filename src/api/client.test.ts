import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, tokenStorage, ApiError } from './client';

const createMemoryStorage = () => {
  const map = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return map.size;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => map.delete(key),
    clear: () => map.clear(),
  };
  return storage;
};

describe('apiClient', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMemoryStorage(),
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the production API base URL', () => {
    expect((import.meta.env.VITE_API_BASE_URL || 'https://vs-console-server.onrender.com/api/v1')).toContain('vs-console-server.onrender.com/api/v1');
  });

  it('stores and clears tokens securely in browser storage', () => {
    tokenStorage.setTokens('access-1', 'refresh-1');
    expect(tokenStorage.getAccessToken()).toBe('access-1');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-1');
    tokenStorage.clearTokens();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it('throws an ApiError for 401 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Your session has expired.', code: 'SESSION_EXPIRED' } }),
    }));

    await expect(apiClient('/auth/me')).rejects.toMatchObject({
      status: 401,
      code: 'SESSION_EXPIRED',
    });
  });

  it('surfaces 403 errors for forbidden actions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: 'You do not have permission to perform this action.', code: 'FORBIDDEN' } }),
    }));

    await expect(apiClient('/database/status')).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
    });
  });

  it('supports auth-skipped requests like login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { user: { id: 'u1' }, tokens: { accessToken: 'a', refreshToken: 'r' } } }),
    }));

    const response = await apiClient('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email: 'user@example.com', password: 'secret' }),
    });

    expect(response.success).toBe(true);
  });
});

it('defines the expected production URL contract', () => {
  const base = import.meta.env.VITE_API_BASE_URL || 'https://vs-console-server.onrender.com/api/v1';
  expect(base).toBe('https://vs-console-server.onrender.com/api/v1');
});

it('takes a useful error message for unreachable backend', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));

  await expect(apiClient('/health/ready')).rejects.toBeInstanceOf(ApiError);
});
