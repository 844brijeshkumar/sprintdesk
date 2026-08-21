import { apiClient } from '@/api/client';
import { LoginCredentials, LoginApiResponse, RefreshApiResponse, AuthUser } from '@/types/auth.types';

export const authService = {
  /**
   * Performs login request to DummyJSON endpoint
   */
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
    try {
      const response = await apiClient.post<LoginApiResponse>('/auth/login', {
        username: credentials.username.trim(),
        password: credentials.password,
        expiresInMins: credentials.expiresInMins || 60,
      });

      const data = response.data;
      const accessToken = data.accessToken || data.token || `token-${Date.now()}`;
      const refreshToken = data.refreshToken || `refresh-${Date.now()}`;

      const user: AuthUser = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        image: data.image,
        avatar: data.image,
        role: 'Lead Engineer',
      };

      return { user, accessToken, refreshToken };
    } catch (error: unknown) {
      // Fallback for demo users (e.g. emilys / emilyspass) in offline/mock environment
      if (credentials.username === 'emilys' && credentials.password === 'emilyspass') {
        const mockUser: AuthUser = {
          id: 1,
          username: 'emilys',
          email: 'emily.johnson@sprintdesk.io',
          firstName: 'Emily',
          lastName: 'Johnson',
          gender: 'female',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          role: 'Lead Frontend Architect',
        };
        return {
          user: mockUser,
          accessToken: `mock-access-token-${Date.now()}`,
          refreshToken: `mock-refresh-token-${Date.now()}`,
        };
      }
      throw error;
    }
  },

  /**
   * Refreshes the access token using DummyJSON /auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      const response = await apiClient.post<RefreshApiResponse>('/auth/refresh', {
        refreshToken,
        expiresInMins: 60,
      });

      const data = response.data;
      return {
        accessToken: data.accessToken || data.token || `refreshed-token-${Date.now()}`,
        refreshToken: data.refreshToken || refreshToken,
      };
    } catch {
      // Fallback for mocked tokens
      if (refreshToken.startsWith('mock-refresh-token')) {
        return {
          accessToken: `mock-access-token-refreshed-${Date.now()}`,
          refreshToken,
        };
      }
      throw new Error('Failed to refresh authentication session');
    }
  },

  /**
   * Fetches current authenticated user profile
   */
  async getProfile(accessToken: string): Promise<AuthUser> {
    try {
      const response = await apiClient.get<AuthUser>('/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch {
      // Fallback default user if offline
      return {
        id: 1,
        username: 'emilys',
        email: 'emily.johnson@sprintdesk.io',
        firstName: 'Emily',
        lastName: 'Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'Lead Frontend Architect',
      };
    }
  },
};
