import Header from "@/components/main/Header";
import "./globals.css";
import "server-only";
import Footer from "@/components/main/Footer";
import { Toaster } from "@/components/ui/sonner";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Header />
        <div className="w-screen min-h-[75vh]">{children}</div>
        <Footer />
        <Toaster/>
      </body>
    </html>
  );
}
