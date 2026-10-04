import { apiClient, ApiResponse } from './client';

export interface UploadedFile {
  id: string;
  submission_id?: string;
  submissionId?: string;
  file_name?: string;
  fileName?: string;
  file_size?: number;
  fileSize?: number;
  mime_type?: string;
  mimeType?: string;
  storage_key?: string;
  storageKey?: string;
  created_at?: string;
  createdAt?: string;
}

export const filesApi = {
  async uploadFile(file: File, submissionId: string): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('submissionId', submissionId);
    formData.append('file', file);

    const res = await apiClient<UploadedFile>('/files/upload', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  async getSubmissionFiles(submissionId: string): Promise<UploadedFile[]> {
    try {
      const res = await apiClient<UploadedFile[]>(`/files/submission/${submissionId}`, {
        method: 'GET',
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  async getFile(id: string): Promise<UploadedFile> {
    const res = await apiClient<UploadedFile>(`/files/${id}`, { method: 'GET' });
    return res.data;
  },

  getDownloadUrl(id: string): string {
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'https://vs-console-server.onrender.com/api/v1';
    return `${base}/files/${id}/download`;
  },
};
