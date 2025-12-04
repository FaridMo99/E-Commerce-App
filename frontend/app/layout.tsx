import "./globals.css";
import "server-only";
import Footer from "@/components/main/Footer";
import { Toaster } from "@/components/ui/sonner";
import { getNewRefreshToken } from "@/lib/queries/server/authQueries";
import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { AccessToken, ChildrenProps, User } from "@/types/types";
import QueryContext from "@/context/QueryContext";
import Header from "@/components/main/header/Header";
import { Questrial } from "next/font/google";

const questrial = Questrial({
  subsets: ["latin"],
  weight: "400",
});

export default async function RootLayout({ children }: ChildrenProps) {
  let user: User | undefined;
  let accessToken: AccessToken | undefined;

  try {
    const res = await getNewRefreshToken();
    user = res.user;
    accessToken = res.accessToken;
  } catch (err) {
    console.log("User not authenticated, Bad Response: " + err);
  }

  return (
    <html lang="de" className={questrial.className}>
      <body>
        <QueryContext>
          <AuthZustandSetter accessToken={accessToken} user={user} />
          <Header />
          <div className="w-screen min-h-[75vh] py-8">{children}</div>
          <Footer />
          <Toaster />
        </QueryContext>
      </body>
    </html>
  );
}
