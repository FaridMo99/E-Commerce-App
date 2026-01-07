import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { getCachedRefreshToken } from "@/lib/queries/server/authQueries";
import { AccessToken, User } from "@/types/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import "server-only";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Profile, Orders and Setting.",
};

async function layout(props:LayoutProps<"/user">) {
  let res;
  let user: User | undefined;
  let accessToken: AccessToken | undefined;

  try {
    res = await getCachedRefreshToken();
  } catch (err) {
    console.log("User not logged in: " + err);
  }

  if (!res?.accessToken) {
    redirect("/");
  }

  return (
    <>
      <AuthZustandSetter accessToken={accessToken} user={user} />
      {props.children}
    </>
  );
}

export default layout;
