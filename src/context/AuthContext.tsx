import {
  createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { api, setAuthToken, setUnauthorizedHandler } from "../api/client";
import { TOKEN_KEY } from "../config/constants";
import { AuthResponse, User } from "../types";
import { RegisterForm } from "../utils/validation";

type RegisterInput = Omit<RegisterForm, "confirmPassword">;

interface AuthContextValue {
  user: User | null;
  loading: boolean; // true while we check for a saved token on app start
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    queryClient.clear(); // don't keep the previous account's cached data
    setUser(null);
  }, [queryClient]);

  const startSession = useCallback(async ({ token, user }: AuthResponse) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(user);
  }, []);

  // expired / invalid token -> back to login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          const { data } = await api.get<{ user: User }>("/users/me");
          setUser(data.user);
        }
      } catch (error) {
        setAuthToken(null);
        // only forget the token if the server says it is invalid (not when offline)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const { data } = await api.post<AuthResponse>("/auth/login", { identifier, password });
      await startSession(data);
    },
    [startSession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const { data } = await api.post<AuthResponse>("/auth/register", input);
      await startSession(data);
    },
    [startSession]
  );

  const logout = useCallback(async () => {
    try {
      // stop push alerts for this account on this device (best effort)
      await api.delete("/users/me/push-token");
    } catch {
      /* ignore */
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
