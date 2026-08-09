import axios from "axios";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080/api/v1";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

async function authenticate(
  endpoint: "login" | "register",
  payload: LoginRequest | RegisterRequest
): Promise<AuthResponse> {
  const response = await axios.post<ApiResponse<AuthResponse>>(
    `${API}/auth/${endpoint}`,
    payload
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || "Authentication failed."
    );
  }

  const auth = response.data.data;

  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", auth.accessToken);
    localStorage.setItem("refreshToken", auth.refreshToken);
  }

  return auth;
}

export const authService = {
  login(request: LoginRequest) {
    return authenticate("login", request);
  },

  register(request: RegisterRequest) {
    return authenticate("register", request);
  },

  async refresh(): Promise<AuthResponse | null> {
    if (typeof window === "undefined") {
      return null;
    }

    const refreshToken =
      localStorage.getItem("refreshToken");

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post<
        ApiResponse<AuthResponse>
      >(`${API}/auth/refresh`, {
        refreshToken,
      });

      if (
        !response.data.success ||
        !response.data.data
      ) {
        throw new Error("Token refresh failed.");
      }

      const auth = response.data.data;

      localStorage.setItem(
        "accessToken",
        auth.accessToken
      );

      if (auth.refreshToken) {
        localStorage.setItem(
          "refreshToken",
          auth.refreshToken
        );
      }

      return auth;
    } catch {
      authService.logout();
      return null;
    }
  },

  logout() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  getAccessToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("accessToken");
  },

  getRefreshToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("refreshToken");
  },

  isAuthenticated() {
    return Boolean(authService.getAccessToken());
  },
};