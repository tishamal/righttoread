import { API_ENDPOINTS } from '../config/apiConfig';
import { httpClient } from '../utils/httpClient';

export interface DeviceDownloadEntry {
  id: number;
  school_name: string;
  census_no: string;
  platform: string | null;
  app_version: string | null;
  mac_address: string | null;
  status: string | null;
  downloaded_date: string; // "YYYY-MM-DD"
  downloaded_time: string; // "2:30 PM"
  created_at: number;      // epoch ms
}

export interface DeviceDownloadsResponse {
  data: DeviceDownloadEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface DeviceDownloadsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const devicesAPI = {
  async getDownloads(params: DeviceDownloadsParams = {}): Promise<DeviceDownloadsResponse> {
    const { page = 1, limit = 50, search } = params;
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {}),
    });
    const data = await httpClient.get<DeviceDownloadsResponse>(
      `${API_ENDPOINTS.devices.downloads}?${qs}`
    );
    return data;
  },

  async deleteDevice(deviceId: number): Promise<void> {
    if (!deviceId || isNaN(deviceId)) {
      throw new Error('Invalid device ID — please refresh the page and try again.');
    }
    await httpClient.delete(`${API_ENDPOINTS.devices.downloads.replace('/downloads', '')}/${deviceId}`);
  },
};
