import type { ApiResponse } from "@droneclub/shared";
import { authStore } from "./authStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, code: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  isFormData?: boolean;
  /** Internal — prevents infinite refresh loops. */
  _retried?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, isFormData, _retried, headers, ...rest } = options;
  const accessToken = authStore.getState().accessToken;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include", // sends the HTTP-only refresh cookie on /api/auth/*
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  // Access token expired mid-session — try exactly one silent refresh, then
  // replay the original request. Never loops more than once.
  if (response.status === 401 && !_retried && path !== "/auth/refresh") {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, _retried: true });
    }
  }

  const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!json || !json.success) {
    const message = json && !json.success ? json.error.message : "Unexpected server response";
    const code = json && !json.success ? json.error.code : "UNKNOWN_ERROR";
    const fieldErrors = json && !json.success ? json.error.fieldErrors : undefined;
    throw new ApiRequestError(message, response.status, code, fieldErrors);
  }

  return json.data;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return false;
        const json = (await res.json()) as ApiResponse<{ accessToken: string }>;
        if (!json.success) return false;
        authStore.setState({ accessToken: json.data.accessToken });
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
