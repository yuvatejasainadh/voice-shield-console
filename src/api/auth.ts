import { apiClient, tokenStorage, ApiResponse } from './client';
import { User, Role } from '../types';

export interface LoginResponseData {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: Role;
    status: 'ACTIVE' | 'DISABLED';
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: string;
  };
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponseData> {
    const res = await apiClient<LoginResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    if (res.data?.tokens) {
      tokenStorage.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      tokenStorage.clearTokens();
    }
  },

  async getMe(): Promise<{ user: User }> {
    const res = await apiClient<{ user: User }>('/auth/me', { method: 'GET' });
    return res.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};
