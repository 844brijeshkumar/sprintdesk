import { create } from 'zustand';
import { AuthState, LoginCredentials } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/api/client';
import { setupAuthInterceptors } from '@/api/interceptors';

const REFRESH_TOKEN_KEY = 'sprintdesk_refresh_token';

export const useAuthStore = create<AuthState>((set, get) => {
  // Wire up the Axios interceptors to use the store's in-memory token
  setupAuthInterceptors(apiClient, {
    getAccessToken: () => get().accessToken,
    setAccessToken: (token) => set({ accessToken: token }),
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    onRefresh: async (refreshToken) => {
      const response = await authService.refreshToken(refreshToken);
      if (response.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }
      return response;
    },
    onAuthFailure: () => {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please log in again.',
      });
    },
  });

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true, // Starts in unknown/loading state on page refresh
    error: null,

    login: async (credentials: LoginCredentials) => {
      set({ isLoading: true, error: null });
      try {
        const { user, accessToken, refreshToken } = await authService.login(credentials);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        set({
          user,
          accessToken, // In-memory only
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid username or password';
        set({
          error: message,
          isLoading: false,
          isAuthenticated: false,
        });
        throw err;
      }
    },

    logout: () => {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    setAccessToken: (token: string | null) => {
      set({ accessToken: token, isAuthenticated: Boolean(token) });
    },

    initAuth: async () => {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      set({ isLoading: true });
      try {
        const refreshResult = await authService.refreshToken(storedRefreshToken);
        const newAccessToken = refreshResult.accessToken;
        if (refreshResult.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshResult.refreshToken);
        }

        const user = await authService.getProfile(newAccessToken);
        set({
          user,
          accessToken: newAccessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },
  };
});
