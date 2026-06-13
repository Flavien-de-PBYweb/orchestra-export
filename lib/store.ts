import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  user: { id: string; name: string; email: string; role: string } | null;
  setUser: (user: AuthStore["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "orchestra-auth" }
  )
);
