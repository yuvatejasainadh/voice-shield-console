import { apiClient } from './client';
import { WorkItem, WorkStatus, Priority } from '../types';

export interface BackendWorkRaw {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: WorkStatus;
  assigned_to?: string;
  assignedTo?: string;
  assigned_by?: string;
  assignedBy?: string;
  created_at?: string;
  updated_at?: string;
  doc_id?: string;
  docId?: string;
}

export function normalizeWork(raw: BackendWorkRaw, userMap?: Record<string, string>): WorkItem {
  const assigneeId = raw.assignedTo || raw.assigned_to || '';
  const assignerId = raw.assignedBy || raw.assigned_by || '';

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    type: 'FEATURE',
    priority: raw.priority || 'MEDIUM',
    status: raw.status || 'ASSIGNED',
    assigneeId,
    assigneeName: userMap?.[assigneeId] || assigneeId || 'Assignee',
    assigneeRole: 'DEVELOPER',
    assignedById: assignerId,
    assignedByName: userMap?.[assignerId] || assignerId || 'Admin',
    dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString(),
    docId: raw.docId || raw.doc_id,
  };
}

export const workApi = {
  async listWork(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
  }): Promise<{ workItems: WorkItem[]; total: number }> {
    const res = await apiClient<BackendWorkRaw[]>('/work', {
      method: 'GET',
      params: params as Record<string, string | number>,
    });
    const list = Array.isArray(res.data) ? res.data : [];
    return {
      workItems: list.map((item) => normalizeWork(item)),
      total: res.pagination?.total ?? list.length,
    };
  },

  async getWork(id: string): Promise<WorkItem> {
    const res = await apiClient<BackendWorkRaw>(`/work/${id}`, { method: 'GET' });
    return normalizeWork(res.data);
  },

  async createWork(payload: {
    title: string;
    description: string;
    priority: Priority;
    assignedTo: string;
  }): Promise<WorkItem> {
    const res = await apiClient<BackendWorkRaw>('/work', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeWork(res.data);
  },

  async updateWork(id: string, payload: Partial<{
    title: string;
    description: string;
    priority: Priority;
    status: WorkStatus;
    assignedTo: string;
  }>): Promise<WorkItem> {
    const res = await apiClient<BackendWorkRaw>(`/work/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return normalizeWork(res.data);
  },

  async acceptWork(id: string): Promise<WorkItem> {
    const res = await apiClient<BackendWorkRaw>(`/work/${id}/accept`, { method: 'POST' });
    return normalizeWork(res.data);
  },

  async startWork(id: string): Promise<WorkItem> {
    const res = await apiClient<BackendWorkRaw>(`/work/${id}/start`, { method: 'POST' });
    return normalizeWork(res.data);
  },

  async completeWork(id: string): Promise<WorkItem> {
    const res = await apiClient<BackendWorkRaw>(`/work/${id}/complete`, { method: 'POST' });
    return normalizeWork(res.data);
  },

  async getWorkDoc(workId: string): Promise<any> {
    try {
      const res = await apiClient(`/work/${workId}/documentation`, { method: 'GET' });
      return res.data;
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async createWorkDoc(workId: string, payload: {
    what_i_did: string;
    why_i_did_it: string;
    changes_made: string;
    testing_performed: string;
    result: string;
    files_affected?: string[];
    problems_encountered?: string;
    solution?: string;
    next_steps?: string;
    references?: string[];
  }): Promise<any> {
    const res = await apiClient(`/work/${workId}/documentation`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};
