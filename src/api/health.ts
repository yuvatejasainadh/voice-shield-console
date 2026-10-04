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
    const base = (
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ||
      'https://vs-console-server.onrender.com'
    ).replace(/\/+$/, '');

    try {
      const res = await fetch(`${base}/health/live`);
      return await res.json();
    } catch {
      return { status: 'DOWN' };
    }
  },

  async getReady(): Promise<HealthReadyResponse> {
    const base = (
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ||
      'https://vs-console-server.onrender.com'
    ).replace(/\/+$/, '');

    try {
      const res = await fetch(`${base}/health/ready`);
      return await res.json();
    } catch {
      return { status: 'NOT_READY' };
    }
  },
};
