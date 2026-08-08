const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://routerx.in";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("routerx_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(", ") : body.message ?? res.statusText;
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface RegisterResponse {
  username: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface ShortenRequest {
  longLink: string;
  shortAlias?: string;
  metaData?: Record<string, unknown>;
}

export interface ShortenResponse {
  shortAlias: string;
  longLink: string;
  userId: string;
  createdAt: string;
  metaData: Record<string, unknown> | null;
}

export const api = {
  register: (username: string, password: string) =>
    request<RegisterResponse>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    request<LoginResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  shorten: (payload: ShortenRequest) =>
    request<ShortenResponse>("/v1/shorten", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export { API_BASE_URL };
