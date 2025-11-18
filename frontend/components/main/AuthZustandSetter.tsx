"use client";
import useAuth from "@/stores/authStore";
import { AccessToken, AuthUser, User } from "@/types/types";
import { useEffect } from "react";

type AuthZustandSetterProps = {
  accessToken?: AccessToken;
  user?: User | AuthUser;
};
function AuthZustandSetter({ accessToken, user }:AuthZustandSetterProps) {
  const setState = useAuth((s) => s.setState);

  useEffect(() => {
    if (accessToken && user) setState(accessToken, user);
  }, [accessToken, user, setState]);

  return null;
}

export default AuthZustandSetter;