import { getNewRefreshToken } from "@/lib/queries/authQueries";
import { ChildrenProps } from "@/types/types";
import { redirect } from "next/navigation";
import "server-only";

async function layout({ children }:ChildrenProps) {
  let res;
  try {
    res = await getNewRefreshToken();
  } catch (err) {
    console.log("User not logged in: " + err);
  }

  if (res?.accessToken) {
    redirect("/"); 
  }

  return children
}

export default layout;
