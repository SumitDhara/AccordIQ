import axios from "axios";

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

apiClient.interceptors.request.use(
  (config) => {
    if (
      typeof window !== "undefined"
    ) {
      const token =
        localStorage.getItem(
          "accessToken"
        );

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
  (error) => {
    if (error.response) {
      console.error(
        "[API Error]",
        {
          status:
            error.response.status,
          url: error.config?.url,
          data:
            error.response.data,
        }
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;