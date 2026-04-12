import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { getProtectedHeaders } from "@/lib/queries/utils";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Profile, Orders and Setting.",
};

async function layout(props: LayoutProps<"/user">) {
  const { accessToken, user } = await getProtectedHeaders(headers);

  if (!accessToken) {
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
