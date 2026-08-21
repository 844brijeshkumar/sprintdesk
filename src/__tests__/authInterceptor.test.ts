import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { setupAuthInterceptors } from '@/api/interceptors';

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

describe('Auth Axios Interceptors', () => {
  let testClient: AxiosInstance;
  let inMemoryToken: string | null = null;
  let storedRefreshToken: string | null = null;
  const refreshSpy = vi.fn((_refreshToken: string) =>
    Promise.resolve({
      accessToken: 'refreshed-new-access-token',
      refreshToken: 'refreshed-new-refresh-token',
    })
  );
  const authFailureSpy = vi.fn(() => {});

  beforeEach(() => {
    inMemoryToken = 'initial-access-token';
    storedRefreshToken = 'valid-refresh-token';

    refreshSpy.mockReset();
    refreshSpy.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return {
        accessToken: 'refreshed-new-access-token',
        refreshToken: 'refreshed-new-refresh-token',
      };
    });

    authFailureSpy.mockReset();

    testClient = axios.create();

    setupAuthInterceptors(testClient, {
      getAccessToken: () => inMemoryToken,
      setAccessToken: (token) => {
        inMemoryToken = token;
      },
      getRefreshToken: () => storedRefreshToken,
      onRefresh: (token: string) => refreshSpy(token),
      onAuthFailure: () => authFailureSpy(),
    });
  });

  it('should inject Bearer token into outbound request headers', async () => {
    testClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      return {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse;
    };

    const response = await testClient.get('/test-endpoint');
    expect(response.config.headers.Authorization).toBe('Bearer initial-access-token');
  });

  it('should catch 401, call onRefresh, update access token, and retry request', async () => {
    let callCount = 0;

    testClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      callCount++;
      if (callCount === 1) {
        // First attempt returns 401 Unauthorized
        const error = new AxiosError(
          'Request failed with status code 401',
          'ERR_BAD_REQUEST',
          config,
          {},
          {
            status: 401,
            statusText: 'Unauthorized',
            data: { message: 'Token expired' },
            headers: {},
            config,
          } as AxiosResponse
        );
        throw error;
      }

      // Second attempt succeeds
      return {
        data: { success: true, message: 'Recovered after token refresh' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse;
    };

    const response = await testClient.get('/protected-resource');

    // Assert that refresh was called
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(refreshSpy).toHaveBeenCalledWith('valid-refresh-token');

    // Assert that in-memory token was updated
    expect(inMemoryToken).toBe('refreshed-new-access-token');

    // Assert that request succeeded on retry
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.config.headers.Authorization).toBe('Bearer refreshed-new-access-token');
    expect(callCount).toBe(2);
  });

  it('should queue concurrent 401 requests and only trigger onRefresh once', async () => {
    testClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      const customConfig = config as CustomRequestConfig;
      // Simulate network request duration
      await new Promise((resolve) => setTimeout(resolve, 5));

      // Return 401 for unretried requests
      if (!customConfig._retry) {
        const error = new AxiosError(
          'Unauthorized',
          'ERR_BAD_REQUEST',
          config,
          {},
          {
            status: 401,
            statusText: 'Unauthorized',
            data: {},
            headers: {},
            config,
          } as AxiosResponse
        );
        throw error;
      }

      return {
        data: { endpoint: config.url, ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse;
    };

    // Trigger 3 concurrent requests simultaneously
    const [res1, res2, res3] = await Promise.all([
      testClient.get('/req-1'),
      testClient.get('/req-2'),
      testClient.get('/req-3'),
    ]);

    // Ensure refresh was called exactly ONCE despite 3 concurrent 401s
    expect(refreshSpy).toHaveBeenCalledTimes(1);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(200);
  });

  it('should call onAuthFailure and reject if refresh token call fails', async () => {
    refreshSpy.mockRejectedValueOnce(new Error('Invalid refresh token'));

    testClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      const error = new AxiosError(
        'Unauthorized',
        'ERR_BAD_REQUEST',
        config,
        {},
        {
          status: 401,
          statusText: 'Unauthorized',
          data: {},
          headers: {},
          config,
        } as AxiosResponse
      );
      throw error;
    };

    await expect(testClient.get('/forbidden')).rejects.toThrow();
    expect(authFailureSpy).toHaveBeenCalledTimes(1);
  });
});
