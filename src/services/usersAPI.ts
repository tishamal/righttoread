// src/services/usersAPI.ts
import { API_ENDPOINTS } from '../config/apiConfig';
import { httpClient } from '../utils/httpClient';

export interface UserRecord {
  sub: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  role: string;
  status: string;
  created_at: string;
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  contact_no: string;
  email: string;
  username: string;
}

export interface UsersListResponse {
  data: UserRecord[];
  total: number;
  next_token?: string | null;
}

export interface UsersQueryParams {
  search?: string;
  limit?: number;
  next_token?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  total?: number;
  next_token?: string;
  message?: string;
  error?: string;
}

export const usersAPI = {
  async getAll(params: UsersQueryParams = {}): Promise<UsersListResponse> {
    const query = new URLSearchParams();
    if (params.search)     query.set('search',     params.search);
    if (params.limit)      query.set('limit',       String(params.limit));
    if (params.next_token) query.set('next_token',  params.next_token);

    const url = `${API_ENDPOINTS.users.list}${query.toString() ? '?' + query.toString() : ''}`;
    const response = await httpClient.get<UsersListResponse>(url);
    return response;
  },

  async create(data: UserFormData): Promise<UserRecord> {
    const response = await httpClient.post<UserRecord>(API_ENDPOINTS.users.create, data);
    return response;
  },
};
