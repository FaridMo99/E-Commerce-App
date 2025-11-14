import { getNewRefreshToken, login, signup } from "@/lib/queries/authQueries";
import type { AccessToken, User } from "@/types/types";
import { LoginSchema, SignupSchema } from "@monorepo/shared";
import { create } from "zustand";

type AuthStore = {
  isAuthenticated: null | boolean;
  user:null | User
  accessToken: null | AccessToken;
  login: (credentials: LoginSchema) => void;
  signup: (credentials: SignupSchema) => void;
  getRefreshToken: () => void;
  setAccessToken: (token: AccessToken) => void;
  setUser:(user:User)=>void
};

//check how to handle errors, like propagate out or handle here or in util fn
const useAuth = create<AuthStore>((set, get) => ({
  isAuthenticated: null,
  user: null,
  accessToken: null,
  login: async (credentials) => {
    const res = await login(credentials);
    set({ accessToken: res.accessToken, isAuthenticated: true });
  },
  //doesnt return access token only sends link, change that here
  signup: async (credentials) => {
    const res = await signup(credentials);
    set({ isAuthenticated: true, accessToken: res.accessToken });
  },
  getRefreshToken: async () => {
    const res = await getNewRefreshToken();
    set({ isAuthenticated: true, accessToken: res.accessToken });
  },
  setAccessToken: (token: string) => {
    set({ accessToken: token, isAuthenticated: true });
  },
  setUser: (user) => {
    set({ user });
  },
}));

export default useAuth;
