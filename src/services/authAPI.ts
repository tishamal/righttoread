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
};
