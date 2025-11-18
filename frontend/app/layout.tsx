import Header from "@/components/main/Header";
import "./globals.css";
import "server-only";
import Footer from "@/components/main/Footer";
import { Toaster } from "@/components/ui/sonner";
import { getNewRefreshToken } from "@/lib/queries/authQueries";
import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { AccessToken, ChildrenProps, User } from "@/types/types";

//get cookie for currency, if not exists set it with EUR as base
export default async function RootLayout({children}:ChildrenProps) {
  let user:User | undefined
  let accessToken:AccessToken | undefined

  try {
    const res = await getNewRefreshToken();
    user = res.user
    accessToken = res.accessToken
  } catch (err) {
    console.log("User not authenticated, Bad Response: " + err);
  }

  return (
    <html lang="de">
      <body>
        <AuthZustandSetter accessToken={ accessToken } user={ user }/>
        <Header />
        <div className="w-screen min-h-[75vh] py-8">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}