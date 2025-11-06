import "server-only"
import Navigation from "./Navigation";
import Searchbar from "./Searchbar";

//disable button when no results
//make links loops
//change it so icons are buttons that open dropdown for previews and inside dropdown are links


function Header() {

  return (
    <header className="w-screen h-[15vh] bg-foreground text-primary-foreground flex items-center justify-between">
      <Searchbar/>
      <Navigation/>
    </header>
  );
}

export default Header