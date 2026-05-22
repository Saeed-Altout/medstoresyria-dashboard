"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      setAuth: (user, token) => set({ user, accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
      hasRole: (...roles) => {
        const role = get().user?.role as UserRole | undefined;
        if (!role) return false;
        return (roles as string[]).includes(role);
      },
    }),
    {
      name: "dashboard-auth",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
