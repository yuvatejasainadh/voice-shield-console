import { apiClient } from './client';
import { ConsoleNotification } from '../types';

export interface BackendNotificationRaw {
  id: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  read?: boolean;
  target_route?: string;
  targetRoute?: string;
  created_at?: string;
}

export function normalizeNotification(raw: BackendNotificationRaw): ConsoleNotification {
  return {
    id: raw.id,
    title: raw.title,
    message: raw.message,
    type: raw.type || 'INFO',
    timestamp: raw.created_at || new Date().toISOString(),
    read: !!raw.read,
    targetRoute: raw.targetRoute || raw.target_route,
  };
}

export const notificationsApi = {
  async listNotifications(): Promise<ConsoleNotification[]> {
    try {
      const res = await apiClient<BackendNotificationRaw[]>('/notifications', { method: 'GET' });
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map(normalizeNotification);
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await apiClient(`/notifications/${id}/read`, { method: 'POST' });
    } catch {
      // Local optimistic fallback
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await apiClient('/notifications/read-all', { method: 'POST' });
    } catch {
      // Local optimistic fallback
    }
  },
};
