"use client"
import { getUserCart } from "@/lib/queries/usersQueries";
import { Loader2, LogIn, MenuIcon } from "lucide-react";
import Link from "next/link";
import CurrencyDropdown from "./CurrencyDropdown";
import UserDropdown from "./UserDropdown";
import ShoppingCartDropdown from "./ShoppingCartDropdown";
import LogoutButton from "./LogoutButton";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

//dont forget the popup for mobile
function Navigation() {
  const { accessToken } = useAuth(state => state)
  const {
    data: cart,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["get user shopping cart", accessToken],
    queryFn: () => {
      if (!accessToken) return Promise.resolve(null);
      return getUserCart(accessToken);
    },
    enabled: !!accessToken,
  });
  
  useEffect(() => {
    if (isError) {
      toast.error(error.message)
    }
  },[isError,error])

  return (
    <nav className="w-1/3 h-full flex justify-evenly items-center z-10">
      <button className="block md:hidden">
        <MenuIcon size={40} />
      </button>
      {isLoading ? <Loader2 className="animate-spin" /> : <ShoppingCartDropdown cart={cart ?? null} />}
      {accessToken && (
        <>
          <UserDropdown />
          <LogoutButton accessToken={accessToken} />
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
