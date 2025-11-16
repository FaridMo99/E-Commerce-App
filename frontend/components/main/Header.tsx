import "server-only";
import Navigation from "./Navigation";
import Searchbar from "./Searchbar";
import { AxeIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import QueryContext from "@/context/QueryContext";

export async function Header() {
  return (
    <header className="w-screen min-h-[15vh] bg-foreground text-primary-foreground flex relative items-center justify-between">
      <QueryContext>
        <Searchbar />
      </QueryContext>
      <Link
        href="/"
        aria-label="go to home"
        className="h-full w-1/8 flex justify-center items-center z-10"
      >
        <AxeIcon size={100} />
      </Link>
      <Suspense fallback={null}>
        <Navigation />
      </Suspense>
    </header>
  );
}

export default Header;
