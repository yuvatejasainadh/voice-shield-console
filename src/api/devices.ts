import { apiClient } from './client';
import { CompatibleDevice } from '../types';

export interface BackendDeviceRaw {
  id: string;
  device_name?: string;
  deviceName?: string;
  model_number?: string;
  modelNumber?: string;
  manufacturer: string;
  android_version?: string;
  androidVersion?: string;
  status: 'ACTIVE' | 'INACTIVE';
  chipset?: string;
  created_at?: string;
  updated_at?: string;
}

export function normalizeDevice(raw: BackendDeviceRaw): CompatibleDevice {
  return {
    id: raw.id,
    name: raw.deviceName || raw.device_name || 'Android Device',
    modelNumber: raw.modelNumber || raw.model_number || '',
    manufacturer: raw.manufacturer,
    androidVersion: raw.androidVersion || raw.android_version || 'Android 14',
    chipset: raw.chipset || 'ARM64 Mobile Processor',
    status: raw.status || 'ACTIVE',
    registeredAt: raw.created_at || new Date().toISOString(),
  };
}

export const devicesApi = {
  async listDevices(): Promise<CompatibleDevice[]> {
    const res = await apiClient<BackendDeviceRaw[]>('/devices', { method: 'GET' });
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map(normalizeDevice);
  },

  async getDevice(id: string): Promise<CompatibleDevice> {
    const res = await apiClient<BackendDeviceRaw>(`/devices/${id}`, { method: 'GET' });
    return normalizeDevice(res.data);
  },

  async createDevice(payload: {
    deviceName: string;
    modelNumber: string;
    manufacturer: string;
    androidVersion: string;
  }): Promise<CompatibleDevice> {
    const res = await apiClient<BackendDeviceRaw>('/devices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeDevice(res.data);
  },

  async deactivateDevice(id: string): Promise<CompatibleDevice> {
    const res = await apiClient<BackendDeviceRaw>(`/devices/${id}/deactivate`, {
      method: 'POST',
    });
    return normalizeDevice(res.data);
  },
};
