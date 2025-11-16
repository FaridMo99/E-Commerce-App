import Header from "@/components/main/Header";
import "./globals.css";
import "server-only";
import Footer from "@/components/main/Footer";
import { Toaster } from "@/components/ui/sonner";
import { getNewRefreshToken } from "@/lib/queries/authQueries";
import useAuth from "@/stores/authStore";

//get cookie for currency, if not exists set it with EUR as base
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const res = await getNewRefreshToken();
    useAuth.setState({ accessToken: res.accessToken, user: res.user });
  } catch (err) {
    console.log("User not authenticated, Bad Response: " + err);
  }

  return (
    <html lang="de">
      <body>
        <Header />
        <div className="w-screen min-h-[75vh] py-8">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
