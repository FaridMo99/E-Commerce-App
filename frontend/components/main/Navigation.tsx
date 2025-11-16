import { Cart, getUserCart } from "@/lib/queries/usersQueries";
import useAuth from "@/stores/authStore";
import { LogIn, MenuIcon } from "lucide-react";
import Link from "next/link";
import CurrencyDropdown from "./CurrencyDropdown";
import UserDropdown from "./UserDropdown";
import ShoppingCartDropdown from "./ShoppingCartDropdown";
import LogoutButton from "./LogoutButton";

//dont forget the popup for mobile
async function Navigation() {
  const accessToken = useAuth.getState().accessToken;

  let cart: Cart | null = null;
  if (accessToken) {
    try {
      const res = await getUserCart(accessToken);
      cart = res;
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <nav className="w-1/3 h-full flex justify-evenly items-center z-10">
      <button className="block md:hidden">
        <MenuIcon size={40} />
      </button>
      <ShoppingCartDropdown cart={cart} />
      {accessToken && (
        <>
          <UserDropdown />
          <LogoutButton />
        </>
      )}
      {!accessToken && (
        <Link
          href="/login"
          aria-label="login or signup"
          className="hidden md:block"
        >
          <LogIn />
        </Link>
      )}
      <CurrencyDropdown />
    </nav>
  );
}

export default Navigation;
