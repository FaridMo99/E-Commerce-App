"use client";
import useAuth from "@/stores/authStore";
import useProducts from "@/stores/productsStore";
import { DollarSign, LogIn, MenuIcon, ShoppingCart, User } from "lucide-react";
import Link from "next/link";

//add logout icon
function Navigation() {
  const productsCount = useProducts((state) => state.products.length);
  const isAuthenticated = useAuth(state => state.isAuthenticated)
  
  return (
    <nav className="w-1/3 h-full flex justify-evenly items-center z-10">
      <button className="block md:hidden">
        <MenuIcon size={40} />
      </button>
      <button
        className="relative hidden md:block"
        aria-label="show shopping cart"
      >
        <ShoppingCart />
        {productsCount > 0 && (
          <div className="absolute bg-red-500 rounded-full w-7 p-2 h-7 flex justify-center items-center -top-4 -right-4">
            {productsCount > 99 ? "99+" : productsCount}
          </div>
        )}
      </button>
      {isAuthenticated ? <button aria-label="show user account" className="hidden md:block">
        <User />
      </button> : <Link href="/login" aria-label="login or signup" className="hidden md:block"><LogIn /></Link>}
      <button aria-label="show currencies" className="hidden md:block">
        <DollarSign />
      </button>
    </nav>
  );
}

export default Navigation;
