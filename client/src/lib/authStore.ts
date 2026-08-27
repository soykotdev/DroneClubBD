import type { UserRole } from "@droneclub/shared";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
}

// Access token lives in memory only — never localStorage/sessionStorage per
// spec Section 14. A full page reload requires POST /api/auth/refresh
// (backed by the HTTP-only refresh cookie) to obtain a new one; see
// features/auth/AuthProvider.tsx.
let state: AuthState = { accessToken: null, user: null };
const listeners = new Set<() => void>();

export const authStore = {
  getState: () => state,
  setState: (next: Partial<AuthState>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
