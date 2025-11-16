import { getNewRefreshToken } from "@/lib/queries/authQueries";
import useAuth from "@/stores/authStore";
import { redirect } from "next/navigation";
import React from "react";
import "server-only";

//check how not to send this to client
//cache the getnewrefreshtoken so when reloading in nested routes it doesnt trigger all layouts requesting refresh tokens
//do this for all nested layouts that repeat the same fn
async function layout({ children }: { children: React.ReactNode }) {
  try {
    const res = await getNewRefreshToken();
    if (res.user.role !== "ADMIN") {
      console.log("user not admin requesting admin route");
      return redirect("/");
    }
    useAuth.setState({ accessToken: res.accessToken, user: res.user });
  } catch (err) {
    console.log("User not logged in, Bad Response: " + err);
    return redirect("/");
  }

  return children;
}

export default layout;
