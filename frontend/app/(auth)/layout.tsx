import { getNewRefreshToken } from "@/lib/queries/authQueries";
import useAuth from "@/stores/authStore";
import { redirect } from "next/navigation";
import React from "react";
import "server-only";

//for protecting routes if !== authenticated allowed if ===authenticated redirect
async function layout({ children }: { children: React.ReactNode }) {
  try {
    const res = await getNewRefreshToken();
    //maybe move this line inside the fn to avoid deduplication everywhere
    useAuth.setState({ accessToken: res.accessToken, user: res.user });
    return redirect("/");
  } catch (err) {
    console.log("User not logged in, Bad Response: " + err);
  }

  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

export default layout;
