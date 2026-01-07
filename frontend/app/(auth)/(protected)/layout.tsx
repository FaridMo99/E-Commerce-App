import { getCachedRefreshToken } from "@/lib/queries/server/authQueries";
import { redirect } from "next/navigation";
import "server-only";

async function layout(props:LayoutProps<"/">) {
  let res;
  try {
    res = await getCachedRefreshToken();
  } catch (err) {
    console.log("User not logged in: " + err);
  }

  if (res?.accessToken) {
    redirect("/");
  }

  return props.children;
}

export default layout;
