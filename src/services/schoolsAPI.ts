// src/services/schoolsAPI.ts
import { API_ENDPOINTS } from '../config/apiConfig';
import { httpClient } from '../utils/httpClient';

export interface RegisteredSchool {
  id: number;
  school_name: string;
  census_no: string;
  province: string;
  district: string;
  zone: string;
  division: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolFormData {
  school_name: string;
  census_no: string;
  province: string;
  district: string;
  zone: string;
  division: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

export const schoolsAPI = {
  async getAll(): Promise<RegisteredSchool[]> {
    try {
      const data = await httpClient.get<ApiResponse<RegisteredSchool[]>>(
        API_ENDPOINTS.schools.list
      );
      if (!data.success) throw new Error(data.error || 'Failed to fetch schools');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching registered schools:', error);
      throw error;
    }
  },

  async create(payload: SchoolFormData): Promise<RegisteredSchool> {
    try {
      const data = await httpClient.post<ApiResponse<RegisteredSchool>>(
        API_ENDPOINTS.schools.create,
        payload
      );
      if (!data.success) throw new Error(data.error || 'Failed to create school');
      return data.data!;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  },

  async update(id: number, payload: Partial<SchoolFormData>): Promise<RegisteredSchool> {
    try {
      const data = await httpClient.put<ApiResponse<RegisteredSchool>>(
        API_ENDPOINTS.schools.update(id),
        payload
      );
      if (!data.success) throw new Error(data.error || 'Failed to update school');
      return data.data!;
    } catch (error) {
      console.error('Error updating school:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      const data = await httpClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.schools.delete(id)
      );
      if (!data.success) throw new Error(data.error || 'Failed to delete school');
    } catch (error) {
      console.error('Error deleting school:', error);
      throw error;
    }
  },
};
