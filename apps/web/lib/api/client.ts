import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { authService } from "@/services/auth.service";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080/api/v1";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (
      typeof window !== "undefined" &&
      !config.headers.Authorization
    ) {
      const token =
        authService.getAccessToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | (InternalAxiosRequestConfig & {
            _retry?: boolean;
          })
        | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise =
          authService
            .refresh()
            .then(
              (auth) =>
                auth?.accessToken ?? null
            )
            .finally(() => {
              refreshPromise = null;
            });
      }

      const newToken =
        await refreshPromise;

      if (!newToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;

      return apiClient.request(
        originalRequest
      );
    } catch {
      return Promise.reject(error);
    }
  }
);

export default apiClient;