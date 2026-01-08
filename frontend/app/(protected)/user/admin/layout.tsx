import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { AccessToken, User } from "@/types/types";
import { redirect } from "next/navigation";
import "server-only";
import Navbar from "./components/Navbar";
import { Metadata } from "next";
import { getNewRefreshToken } from "@/lib/queries/server/authQueries";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage your Shop, Orders and Products.",
};

async function layout(props: LayoutProps<"/user/admin">) {
  let res;
  let user: User | undefined;
  let accessToken: AccessToken | undefined;

  try {
    res = await getNewRefreshToken();
    accessToken = res.accessToken;
    user = res.user;
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
      <Navbar />
      <main className="w-full pl-[20vw] pr-[10vw] flex flex-col items-center justify-evenly">
        {props.children}
      </main>
    </>
  );
}

export default layout;
