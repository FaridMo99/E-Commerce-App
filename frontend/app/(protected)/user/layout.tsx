import { getNewRefreshToken } from "@/lib/queries/authQueries";
import useAuth from "@/stores/authStore";
import { redirect } from "next/navigation";
import React from "react";
import "server-only";

async function layout({ children }: { children: React.ReactNode }) {
  try {
    const res = await getNewRefreshToken();
    //maybe move this line inside the fn to avoid deduplication everywhere
    useAuth.setState({ accessToken: res.accessToken, user: res.user });
  } catch (err) {
    console.log("User not logged in, Bad Response: " + err);
    return redirect("/");
  }

  return children;
}

export default layout;
