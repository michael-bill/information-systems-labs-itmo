import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { MenuState } from "../types/MenuState";

type Storage = {
  login: string;
  token: string;
  currentMenuState: MenuState;
  setLogin: (login: string) => void;
  setToken: (token: string) => void;
  setCurrentMenuState: (state: MenuState) => void;
  getCredentials: () => { role: string } | null;
  getRole: () => string;
  reset: () => void;
};

const getCredentialsFromToken = (token: string) => {
  try {
    const decoded = jwtDecode<{ role: string; userId: number }>(token);
    return { role: decoded.role, id: decoded.userId };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Persist storage state to localStorage
const useStorage = create<Storage>()(
  persist(
    (set, get) => ({
      login: "",
      token: "",
      currentMenuState: MenuState.Dashboard,
      setLogin: (login: string) => set({ login }),
      setToken: (token: string) => set({ token }),
      setCurrentMenuState: (state: MenuState) =>
        set({ currentMenuState: state }),
      getCredentials: () => getCredentialsFromToken(get().token),
      getRole: () => getCredentialsFromToken(get().token)?.role ?? "ROLE_USER",
      reset: () =>
        set({ login: "", token: "", currentMenuState: MenuState.Dashboard }),
    }),
    {
      name: "application-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useStorage };
