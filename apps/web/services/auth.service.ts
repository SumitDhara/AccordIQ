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
  endpoint: string,
  payload: LoginRequest | RegisterRequest
): Promise<AuthResponse> {
  const response = await axios.post<
    ApiResponse<AuthResponse>
  >(`${API}/auth/${endpoint}`, payload);

  const auth = response.data.data;

  localStorage.setItem(
    "accessToken",
    auth.accessToken
  );

  localStorage.setItem(
    "refreshToken",
    auth.refreshToken
  );

  return auth;
}

export const authService = {
  login(request: LoginRequest) {
    return authenticate("login", request);
  },

  register(request: RegisterRequest) {
    return authenticate("register", request);
  },

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  getAccessToken() {
    return localStorage.getItem("accessToken");
  },

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  },

  isAuthenticated() {
    return Boolean(
      localStorage.getItem("accessToken")
    );
  },
};