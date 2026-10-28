import axios from "axios";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_URL, timeout: 60000 });

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// AuthContext registers a callback so an expired token logs the user out
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error?.config?.url?.startsWith("/auth/");
    if (axios.isAxiosError(error) && error.response?.status === 401 && authToken && !isAuthRoute) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
