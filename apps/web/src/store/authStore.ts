import { create } from 'zustand';
import { User, AuthResponse } from '@stock-market/shared-types';
import { api, realtime } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('stoke_access_token'),
  isLoading: true,

  login: (authResponse: AuthResponse) => {
    localStorage.setItem('stoke_access_token', authResponse.tokens.accessToken);
    localStorage.setItem('stoke_refresh_token', authResponse.tokens.refreshToken);
    realtime.connect(authResponse.tokens.accessToken);
    set({
      user: authResponse.user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('stoke_access_token');
    localStorage.removeItem('stoke_refresh_token');
    realtime.disconnect();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchMe: async () => {
    try {
      const token = localStorage.getItem('stoke_access_token');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const user = await api.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('stoke_access_token');
      localStorage.removeItem('stoke_refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
