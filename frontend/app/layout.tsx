import Header from "@/components/main/Header";
import "./globals.css";
import "server-only";
import Footer from "@/components/main/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <Header />
        <main className="w-screen min-h-[75vh] overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
