import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiRequestError } from "@/lib/api";
import { authStore, type AuthUser } from "@/lib/authStore";
import { Propeller } from "@/components/brand/Propeller";

interface AuthContextValue {
  user: AuthUser | null;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Bootstraps a session on load by attempting a silent refresh against the
 * HTTP-only refresh cookie — the access token itself is never persisted
 * client-side, so this is the only way a reload keeps you signed in.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    void bootstrap();
    const unsubscribe = authStore.subscribe(() => setUser(authStore.getState().user));
    return () => {
      unsubscribe();
    };
  }, []);

  async function bootstrap() {
    try {
      const result = await api.post<{ accessToken: string }>("/auth/refresh");
      authStore.setState({ accessToken: result.accessToken });
      const me = await api.get<AuthUser & { mustChangePassword: boolean }>("/auth/me");
      authStore.setState({ user: me });
      setUser(me);
      setMustChangePassword(me.mustChangePassword);
    } catch {
      // No active session — normal for a first-time or logged-out visitor.
    } finally {
      setBootstrapped(true);
    }
  }

  async function login(email: string, password: string) {
    const result = await api.post<{ accessToken: string; mustChangePassword: boolean; user: AuthUser }>("/auth/login", { email, password });
    authStore.setState({ accessToken: result.accessToken, user: result.user });
    setUser(result.user);
    setMustChangePassword(result.mustChangePassword);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      if (!(error instanceof ApiRequestError)) throw error;
    } finally {
      authStore.setState({ accessToken: null, user: null });
      setUser(null);
    }
  }

  async function refreshUser() {
    const me = await api.get<AuthUser & { mustChangePassword: boolean }>("/auth/me");
    authStore.setState({ user: me });
    setUser(me);
    setMustChangePassword(me.mustChangePassword);
  }

  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <Propeller size={36} color="white" />
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, mustChangePassword, login, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
