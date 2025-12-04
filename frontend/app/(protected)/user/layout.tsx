import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { getNewRefreshToken } from "@/lib/queries/server/authQueries";
import { AccessToken, User } from "@/types/types";
import { redirect } from "next/navigation";
import "server-only";

async function layout(props:LayoutProps<"/user">) {
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

  return (
    <>
      <AuthZustandSetter accessToken={accessToken} user={user} />
      {props.children}
    </>
  );
}

export default layout;
