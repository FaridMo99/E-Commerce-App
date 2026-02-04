import { getProtectedHeaders } from "@/lib/queries/utils";
import { redirect } from "next/navigation";
import "server-only";

async function layout(props: LayoutProps<"/">) {
  const {accessToken} = await getProtectedHeaders()

  if (!accessToken) {
    redirect("/");
  }

  return props.children;
}

export default layout;
