import { HEALTH_BASE_URL } from './client';

export interface HealthLiveResponse {
  status: 'UP' | 'DOWN';
  uptime?: number;
  timestamp?: string;
}

export interface HealthReadyResponse {
  status: 'READY' | 'NOT_READY';
  checks?: {
    application?: 'UP' | 'DOWN';
    database?: 'CONNECTED' | 'DISCONNECTED';
    storage?: 'S3_CONFIGURED' | 'S3_UNCONFIGURED';
  };
  timestamp?: string;
}

export const healthApi = {
  async getLive(): Promise<HealthLiveResponse> {
    try {
      const res = await fetch(`${HEALTH_BASE_URL}/live`);
      return await res.json();
    } catch {
      return { status: 'DOWN' };
    }
  },

  async getReady(): Promise<HealthReadyResponse> {
    try {
      const res = await fetch(`${HEALTH_BASE_URL}/ready`);
      return await res.json();
    } catch {
      return { status: 'NOT_READY' };
    }
  },
};
