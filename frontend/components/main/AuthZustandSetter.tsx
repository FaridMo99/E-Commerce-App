"use client";
import useAuth from "@/stores/authStore";
import { AccessToken, AuthUser, User } from "@/types/types";
import { useEffect, useRef } from "react";
import { getNewRefreshToken } from "@/lib/queries/server/authQueries";
import { useRouter } from "next/navigation";

type AuthZustandSetterProps = {
  accessToken?: AccessToken;
  user?: User | AuthUser;
};

function AuthZustandSetter({ accessToken, user }: AuthZustandSetterProps) {
  const setState = useAuth((s) => s.setState);
  const intervalSet = useRef(false);
  const router = useRouter()

  useEffect(() => {
    if (accessToken && user) setState(accessToken, user);
  }, [accessToken, user, setState]);


  useEffect(() => {
    if (!accessToken || intervalSet.current) return;

    intervalSet.current = true;

    const refreshToken = async () => {
      try {
        const res = await getNewRefreshToken();
        if (res?.accessToken && res.user) {
          setState(res.accessToken, res.user);
        } else {
          router.push("/")
        }
      } catch (err) {
        console.error("Token refresh failed", err);
        window.location.href = "/";
      }
    };

    const interval = setInterval(refreshToken, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [accessToken, setState,router]);

  return null;
}

export default AuthZustandSetter;
