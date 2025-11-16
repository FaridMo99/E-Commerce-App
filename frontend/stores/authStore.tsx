import type { AccessToken, User } from "@/types/types";
import { create } from "zustand";

type AuthStore = {
  user: null | User;
  accessToken: null | AccessToken;
  clearState: () => void;
};

const useAuth = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  clearState: () => {
    set({ user: null, accessToken: null });
  },
}));

export default useAuth;
