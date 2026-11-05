import { ApiClient, RealtimeClient } from '@stock-market/api-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:5001';

export const api = new ApiClient({
  baseUrl: API_BASE,
  getToken: () => {
    return localStorage.getItem('stoke_access_token');
  },
  setToken: (token: string, refreshToken?: string) => {
    localStorage.setItem('stoke_access_token', token);
    if (refreshToken) {
      localStorage.setItem('stoke_refresh_token', refreshToken);
    }
  },
  onAuthError: () => {
    localStorage.removeItem('stoke_access_token');
    localStorage.removeItem('stoke_refresh_token');
  },
});

export const realtime = new RealtimeClient(WS_BASE);
realtime.connect(localStorage.getItem('stoke_access_token') || undefined);
