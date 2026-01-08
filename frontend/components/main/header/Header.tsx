import "server-only";
import Link from "next/link";
import Searchbar from "./Searchbar";
import Navigation from "./Navigation";

export async function Header() {
  return (
    <header className="w-screen h-[15vh] bg-foreground text-primary-foreground flex items-center justify-evenly">
      <Link
        href="/"
        aria-label="go to home"
        className="h-full w-1/8 flex flex-1 items-center z-10"
      >
        <img src="/logoIcon.png" className="w-40" alt="logo" />
      </Link>
      <Searchbar />
      <Navigation />
    </header>
  );
}

export default Header;
