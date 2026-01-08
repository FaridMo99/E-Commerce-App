import "./globals.css";
import "server-only";
import Footer from "@/components/main/Footer";
import { Toaster } from "@/components/ui/sonner";
import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { AccessToken, ChildrenProps, User } from "@/types/types";
import QueryContext from "@/context/QueryContext";
import Header from "@/components/main/header/Header";
import { Questrial } from "next/font/google";
import { Metadata, Viewport } from "next";
import { DOMAIN, DOMAIN_NAME } from "@/config/constants";
import { getNewRefreshToken } from "@/lib/queries/server/authQueries";

const questrial = Questrial({
  subsets: ["latin"],
  weight: "400",
});

export const viewport: Viewport = { themeColor: "#f46b61" };

export const metadata: Metadata = {
  title: DOMAIN_NAME,
  metadataBase: new URL(DOMAIN!),
  description: "Online Shop for various Products",
  authors: [{ name: "Farid Mohseni" }],
  openGraph: {
    title: DOMAIN_NAME,
    description: "Online Shop",
    url: DOMAIN,
    siteName: DOMAIN_NAME,
    type: "website",
    locale: "de_DE",
    images: [
      {
        url: "/logoIcon.png",
        width: 1200,
        height: 630,
        alt: "Shop Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DOMAIN_NAME,
    description: "Online Shop",
    images: [
      {
        url: "/logoIcon.png",
        width: 1200,
        height: 630,
        alt: "Shop Logo",
      },
    ],
  },
};


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
      <body className="overflow-x-hidden">
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
