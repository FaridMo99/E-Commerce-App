import "server-only";
import Link from "next/link";
import Searchbar from "./Searchbar";
import Navigation from "./Navigation";

export async function Header() {
  return (
    <header className="w-screen h-[15vh] bg-foreground text-primary-foreground flex relative items-center justify-between">
        <Searchbar />
        <Link
          href="/"
          aria-label="go to home"
          className="h-full w-1/8 flex justify-center items-center z-10"
        >
          <img src="/logoIcon.png"/>
        </Link>
        <Navigation />
    </header>
  );
}

export default Header;
