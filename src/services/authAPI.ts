// src/services/authAPI.ts
import { API_ENDPOINTS } from '../config/apiConfig';
import { httpClient } from '../utils/httpClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ChallengeResponse {
  challenge: string;
  session: string;
  username: string;
}

export type LoginResponse = TokenResponse | ChallengeResponse;

export function isChallenge(r: LoginResponse): r is ChallengeResponse {
  return 'challenge' in r;
}

export interface SetPasswordRequest {
  username: string;
  new_password: string;
  session: string;
}

export interface CognitoUserAttributes {
  username: string;
  email: string | null;
  phone_number: string | null;
  name: string | null;
  given_name: string | null;
  family_name: string | null;
}

export interface UpdateUserRequest {
  name?: string;
  phone_number?: string;
  role?: string;
  department?: string;
}

export const authAPI = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>(API_ENDPOINTS.auth.login, data);
  },

  async setPassword(data: SetPasswordRequest): Promise<TokenResponse> {
    return httpClient.post<TokenResponse>(API_ENDPOINTS.auth.setPassword, data);
  },

  saveTokens(tokens: TokenResponse) {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('id_token',     tokens.id_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  },

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  async getMe(): Promise<CognitoUserAttributes> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    return httpClient.get<CognitoUserAttributes>(
      API_ENDPOINTS.auth.me,
      { headers: { Authorization: `Bearer ${token}` } },
      true, // skip cache — always fetch fresh attributes
    );
  },

  async updateMe(data: UpdateUserRequest): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    await httpClient.put<unknown>(
      API_ENDPOINTS.auth.me,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
};
