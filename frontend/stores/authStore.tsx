import type { AccessToken, AuthUser, User } from "@/types/types";
import { create } from "zustand";

type ZustandUser = null | User | AuthUser
type ZustandToken = null | AccessToken

type AuthStore = {
  user: ZustandUser;
  accessToken: ZustandToken;
  clearState: () => void;
  setAccessToken: (accessToken: AccessToken) => void;
  setUser: (user: User) => void
  setState:(accessToken:ZustandToken,user:ZustandUser)=>void
};

const useAuth = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  clearState: () => {
    set({ user: null, accessToken: null });
  },
  setAccessToken: (accessToken) => {
    set({accessToken})
  },
  setUser: (user) => {
    set({user})
  },
  setState: (accessToken, user) => {
    console.log("running setstaet")
    set({accessToken,user})
  }
}));

export default useAuth;
