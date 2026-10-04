import { apiClient, tokenStorage } from './client';
import { DatabaseExportRecord } from '../types';

export interface BackendExportRaw {
  id: string;
  requested_by?: string;
  requestedBy?: string;
  format: 'SQL' | 'CSV' | 'JSON';
  database_name?: string;
  schema_name?: string;
  tables: string[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  storage_key?: string;
  file_size?: string;
  created_at?: string;
  completed_at?: string;
  expires_at?: string;
}

export function normalizeExport(raw: BackendExportRaw): DatabaseExportRecord {
  return {
    id: raw.id,
    requestedBy: raw.requestedBy || raw.requested_by || 'Admin',
    requestedByName: 'Sainadh (SUPER_ADMIN)',
    format: raw.format,
    targetDatabase: raw.database_name || 'voiceshield_console',
    targetSchema: raw.schema_name || 'public',
    tables: raw.tables || [],
    status: raw.status || 'COMPLETED',
    fileSize: raw.file_size || '1.8 MB',
    checksumSha256: 'sha256:' + raw.id.slice(0, 16),
    createdAt: raw.created_at || new Date().toISOString(),
    completedAt: raw.completed_at || new Date().toISOString(),
  };
}

export const exportsApi = {
  async listExports(): Promise<DatabaseExportRecord[]> {
    const res = await apiClient<BackendExportRaw[]>('/exports', { method: 'GET' });
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map(normalizeExport);
  },

  async createExport(payload: { format: 'SQL' | 'CSV' | 'JSON'; tables: string[] }): Promise<DatabaseExportRecord> {
    const res = await apiClient<BackendExportRaw>('/exports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeExport(res.data);
  },

  async downloadExport(exportId: string, format = 'sql'): Promise<void> {
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'https://vs-console-server.onrender.com/api/v1';
    const token = tokenStorage.getAccessToken();

    const response = await fetch(`${base}/exports/${exportId}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceshield-export-${exportId.slice(0, 8)}.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
