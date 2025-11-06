"use client"
import useProducts from "@/stores/productsStore";
import { MenuIcon, Settings2, ShoppingCart, User } from "lucide-react";
import Link from "next/link";


function Navigation() {

    const productsCount = useProducts((state) => state.products.length);

  return (
    <nav className="w-1/3 h-full flex justify-evenly items-center ">
      <button className="block md:hidden">
        <MenuIcon />
      </button>
      <Link
        href="/cart"
        className="relative hidden md:block"
        aria-label="show shopping cart"
      >
        <ShoppingCart />
        {productsCount > 0 && (
          <div className="absolute bg-red-500 rounded-full w-7 p-2 h-7 flex justify-center items-center -top-4 -right-4">
            {productsCount > 99 ? "99+" : productsCount}
          </div>
        )}
      </Link>
      <Link
        href="/user"
        aria-label="go to user account"
        className="hidden md:block"
      >
        <User />
      </Link>
      <Link
        href="/settings"
        aria-label="go to settings"
        className="hidden md:block"
      >
        <Settings2 />
      </Link>
    </nav>
  );
}

export default Navigation