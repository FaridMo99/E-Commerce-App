import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { getNewRefreshToken } from "@/lib/queries/server/authQueries";
import { AccessToken, ChildrenProps, User } from "@/types/types";
import { redirect } from "next/navigation";
import "server-only";

//check how not to send this to client
//cache the getnewrefreshtoken so when reloading in nested routes it doesnt trigger all layouts requesting refresh tokens
//do this for all nested layouts that repeat the same fn

async function layout({ children }: ChildrenProps) {
  let res;
  let user: User | undefined;
  let accessToken: AccessToken | undefined;

  try {
    res = await getNewRefreshToken();
  } catch (err) {
    console.log("User not logged in: " + err);
  }

  if (!res?.accessToken) {
    redirect("/");
  }
  if (res.user.role !== "ADMIN") {
    redirect("/user");
  }

  return (
    <>
      <AuthZustandSetter accessToken={accessToken} user={user} />
      {children}
    </>
  );
}

export default layout;
