import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { api } from "./api";

const TOKEN_KEY = "routerx_token";

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload | null): boolean {
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}

interface AuthContextValue {
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUsername(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const payload = decodeToken(token);
  if (isExpired(payload)) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return payload!.sub;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => readStoredUsername());

  const login = useCallback(async (user: string, password: string) => {
    const { access_token } = await api.login(user, password);
    localStorage.setItem(TOKEN_KEY, access_token);
    setUsername(user);
  }, []);

  const register = useCallback(async (user: string, password: string) => {
    await api.register(user, password);
    await login(user, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({ username, isAuthenticated: username !== null, login, register, logout }),
    [username, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
