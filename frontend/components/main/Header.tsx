import "server-only";
import Navigation from "./Navigation";
import Searchbar from "./Searchbar";
import { AxeIcon } from "lucide-react";
import Link from "next/link";

//disable button when no results
//make links loops
//change it so icons are buttons that open dropdown for previews and inside dropdown are links

function Header() {
  return (
    <header className="w-screen h-[15vh] bg-foreground text-primary-foreground flex relative items-center justify-between">
      <Searchbar />
      <Link
        href="/"
        aria-label="go to home"
        className="h-full w-1/8 flex justify-center items-center z-10">
        <AxeIcon size={100}/>
      </Link>
      <Navigation />
    </header>
  );
}

export default Header;
