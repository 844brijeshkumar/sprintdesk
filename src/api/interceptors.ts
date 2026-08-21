import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface QueuedPromise {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

export interface InterceptorOptions {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  getRefreshToken: () => string | null;
  onRefresh: (refreshToken: string) => Promise<{ accessToken: string; refreshToken?: string }>;
  onAuthFailure: () => void;
}

export function setupAuthInterceptors(
  client: AxiosInstance,
  options: InterceptorOptions
): { requestInterceptorId: number; responseInterceptorId: number } {
  const { getAccessToken, setAccessToken, getRefreshToken, onRefresh, onAuthFailure } = options;

  let isRefreshing = false;
  let failedQueue: QueuedPromise[] = [];

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Request Interceptor: Attach in-memory Bearer token
  const requestInterceptorId = client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: unknown) => Promise.reject(error)
  );

  // Response Interceptor: Handle 401 Unauthorized with Refresh Queue
  const responseInterceptorId = client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If error is not 401 or request has already been retried, propagate error
      if (!error.response || error.response.status !== 401 || !originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      // Check if we are already refreshing
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              originalRequest._retry = true;
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(client(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        isRefreshing = false;
        onAuthFailure();
        return Promise.reject(error);
      }

      try {
        const refreshResult = await onRefresh(currentRefreshToken);
        const newAccessToken = refreshResult.accessToken;

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        onAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return { requestInterceptorId, responseInterceptorId };
}
