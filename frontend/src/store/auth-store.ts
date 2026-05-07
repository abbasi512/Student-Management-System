"use client";

import { create } from "zustand";

import { api } from "@/lib/api";
import type { AuthResponse, AuthUser, Role, UserProfileResponse } from "@/lib/types";

type Credentials = {
  email: string;
  password: string;
};

type SignupPayload = Credentials & {
  name: string;
  role: Role;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  bootstrap: () => Promise<void>;
  login: (payload: Credentials) => Promise<AuthResponse>;
  signup: (payload: SignupPayload) => Promise<AuthResponse>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  hydrated: false,
  setHydrated: (value) => set({ hydrated: value }),
  bootstrap: async () => {
    if (typeof window === "undefined") return;

    // Already hydrated (e.g., right after login/signup) — skip the extra /users/me call
    if (get().hydrated) return;

    const token = localStorage.getItem("sms_token");

    if (!token) {
      set({ hydrated: true, user: null, token: null });
      return;
    }

    try {
      const profileResponse = await api.get<UserProfileResponse>("/users/me");
      set({ user: profileResponse.data, token, hydrated: true });
    } catch {
      localStorage.removeItem("sms_token");
      set({ user: null, token: null, hydrated: true });
    }
  },
  login: async (payload) => {
    const response = await api.post<AuthResponse>("/auth/login", payload);
    localStorage.setItem("sms_token", response.data.token);
    set({ token: response.data.token, user: response.data.user, hydrated: true });
    return response.data;
  },
  signup: async (payload) => {
    const response = await api.post<AuthResponse>("/auth/signup", payload);
    localStorage.setItem("sms_token", response.data.token);
    set({ token: response.data.token, user: response.data.user, hydrated: true });
    return response.data;
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sms_token");
    }

    set({ user: null, token: null, hydrated: false });
  },
}));
