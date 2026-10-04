import { apiClient } from './client';
import { AuditEvent, Role } from '../types';

export interface BackendAuditRaw {
  id: string;
  event_type?: string;
  eventType?: string;
  actor_id?: string;
  actorId?: string;
  actor_role?: Role;
  actorRole?: Role;
  action?: string;
  resource_type?: string;
  resourceType?: string;
  request_id?: string;
  requestId?: string;
  ip_address?: string;
  ipAddress?: string;
  user_agent?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  createdAt?: string;
}

export function normalizeAudit(raw: BackendAuditRaw, userMap?: Record<string, string>): AuditEvent {
  const actorId = raw.actorId || raw.actor_id || 'system';
  const role = raw.actorRole || raw.actor_role || 'SUPER_ADMIN';
  const action = raw.action || raw.eventType || raw.event_type || 'SYSTEM_ACTION';
  const resource = raw.resourceType || raw.resource_type || 'SYSTEM';

  return {
    id: raw.id,
    timestamp: raw.createdAt || raw.created_at || new Date().toISOString(),
    actorId,
    actorName: userMap?.[actorId] || (role === 'SUPER_ADMIN' ? 'Sainadh' : actorId),
    actorRole: role,
    action: action as any,
    resource,
    resourceId: raw.metadata?.instance || raw.requestId || raw.request_id || raw.id.slice(0, 8),
    result: 'SUCCESS',
    ipAddress: raw.ipAddress || raw.ip_address || '127.0.0.1',
    userAgent: raw.userAgent || raw.user_agent || 'Mozilla/5.0 (Console/Production)',
    details: {
      summary: `${action.replace(/_/g, ' ')} on ${resource}`,
      payload: raw.metadata,
    },
  };
}

export const auditApi = {
  async listAuditLogs(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    action?: string;
    role?: string;
  }): Promise<{ events: AuditEvent[]; total: number }> {
    const res = await apiClient<BackendAuditRaw[]>('/audit', {
      method: 'GET',
      params: params as Record<string, string | number>,
    });
    const list = Array.isArray(res.data) ? res.data : [];
    return {
      events: list.map((a) => normalizeAudit(a)),
      total: res.pagination?.total ?? list.length,
    };
  },

  async getAuditLog(id: string): Promise<AuditEvent> {
    const res = await apiClient<BackendAuditRaw>(`/audit/${id}`, { method: 'GET' });
    return normalizeAudit(res.data);
  },
};
