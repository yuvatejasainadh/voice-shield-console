import { apiClient } from './client';
import { User, Role } from '../types';

export interface BackendUserRaw {
  id: string;
  email: string;
  display_name?: string;
  displayName?: string;
  role: Role;
  status: 'ACTIVE' | 'DISABLED';
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

export function normalizeUser(raw: BackendUserRaw): User {
  return {
    id: raw.id,
    name: raw.displayName || raw.display_name || raw.email.split('@')[0],
    email: raw.email,
    role: raw.role,
    status: raw.status === 'DISABLED' ? 'INACTIVE' : 'ACTIVE',
    lastActive: raw.last_login_at || raw.updated_at || raw.created_at || new Date().toISOString(),
    createdAt: raw.created_at || new Date().toISOString(),
  };
}

export const usersApi = {
  async listUsers(params?: {
    page?: number;
    pageSize?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const res = await apiClient<BackendUserRaw[]>('/users', {
      method: 'GET',
      params: params as Record<string, string | number>,
    });
    const list = Array.isArray(res.data) ? res.data : [];
    return {
      users: list.map(normalizeUser),
      total: res.pagination?.total ?? list.length,
    };
  },

  async createUser(payload: {
    email: string;
    password: string;
    displayName: string;
    role: Role;
    status?: 'ACTIVE' | 'DISABLED';
  }): Promise<User> {
    const res = await apiClient<BackendUserRaw>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeUser(res.data);
  },
};
