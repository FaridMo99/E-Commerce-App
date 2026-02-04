import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { redirect } from "next/navigation";
import "server-only";
import Navbar from "./components/Navbar";
import { Metadata } from "next";
import { getProtectedHeaders } from "@/lib/queries/utils";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage your Shop, Orders and Products.",
};

async function layout(props: LayoutProps<"/user/admin">) {
  const {accessToken, user} = await getProtectedHeaders()

  if (!accessToken) {
    redirect("/");
  }
  if (user.role !== "ADMIN") {
    redirect("/user");
  }

  return (
    <>
      <AuthZustandSetter accessToken={accessToken} user={user} />
      <Navbar />
      <main className="w-full pl-[20vw] pr-[10vw] flex flex-col items-center justify-evenly">
        {props.children}
      </main>
    </>
  );
}

export default layout;
