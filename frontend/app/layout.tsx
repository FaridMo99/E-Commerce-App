import "./globals.css";
import "server-only";
import Footer from "@/components/main/Footer";
import { Toaster } from "@/components/ui/sonner";
import AuthZustandSetter from "@/components/main/AuthZustandSetter";
import { ChildrenProps } from "@/types/types";
import QueryContext from "@/context/QueryContext";
import Header from "@/components/main/header/Header";
import { Questrial } from "next/font/google";
import { Metadata, Viewport } from "next";
import { DOMAIN, DOMAIN_NAME } from "@/config/constants";
import { getProtectedHeaders } from "@/lib/queries/utils";
import { headers } from "next/headers";

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
  const { accessToken, user } = await getProtectedHeaders(headers);

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
