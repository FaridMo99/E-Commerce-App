"use client";
import { getUserCart } from "@/lib/queries/server/usersQueries";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import ShoppingCartDropdown from "./ShoppingCartDropdown";
import UserDropdown from "../UserDropdown";
import LogoutButton from "./LogoutButton";
import { MobileNavigation } from "./MobileNavigation";


function Navigation() {
  const { accessToken,user } = useAuth((state) => state);
  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["get user shopping cart",user],
    queryFn: () => {
      if (!accessToken) return Promise.resolve(null);
      return getUserCart(accessToken);
    },
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (isError) {
      toast.error(error.message);
    }
  }, [isError, error]);

  return (
    <nav className="w-1/3 h-full flex justify-evenly items-center z-10">
      <MobileNavigation />
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <ShoppingCartDropdown cart={cart ?? null} />
      )}
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
    </nav>
  );
}

export default Navigation;
