import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { api, TOKEN_KEY } from "@/lib/api";
import type { AuthUser, AuthResponse, Role } from "@/lib/types";

type LoginPayload = { email: string; password: string };
type SignupPayload = { name: string; email: string; password: string; role: Role };

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  hydrated: false,

  bootstrap: async () => {
    if (get().hydrated) return;
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ hydrated: true });
        return;
      }
      const { data } = await api.get<AuthUser>("/users/me");
      set({ user: data, token, hydrated: true });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => null);
      set({ user: null, token: null, hydrated: true });
    }
  },

  login: async (payload) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    set({ user: data.user, token: data.token, hydrated: true });
  },

  signup: async (payload) => {
    const { data } = await api.post<AuthResponse>("/auth/signup", payload);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    set({ user: data.user, token: data.token, hydrated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => null);
    set({ user: null, token: null, hydrated: false });
  },

  setUser: (user) => set({ user }),
}));
