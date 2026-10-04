import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthUser } from "@/features/auth/types";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Session Expired Modal State
  isSessionExpiredModalOpen: boolean;
  expiredRedirectUrl: string | null;

  setAuth: (token: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  openSessionExpiredModal: (redirectUrl?: string) => void;
  closeSessionExpiredModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      isSessionExpiredModalOpen: false,
      expiredRedirectUrl: null,

      setAuth: (token: string, refreshToken: string, user: AuthUser) =>
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true,
          isSessionExpiredModalOpen: false,
        }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      openSessionExpiredModal: (redirectUrl?: string) =>
        set({
          isSessionExpiredModalOpen: true,
          expiredRedirectUrl: redirectUrl ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : null),
        }),

      closeSessionExpiredModal: () =>
        set({
          isSessionExpiredModalOpen: false,
        }),
    }),
    {
      name: "invostar-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        expiredRedirectUrl: state.expiredRedirectUrl,
      }),
    }
  )
);
