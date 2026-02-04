import { getProtectedHeaders } from "@/lib/queries/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";

async function layout(props: LayoutProps<"/">) {
  const {accessToken} = await getProtectedHeaders(headers)

  if (accessToken) {
    redirect("/");
  }

  return props.children;
}

export default layout;
