"use client"
import { Search, Settings2, ShoppingCart, User } from "lucide-react"
import { Input } from "../ui/input"
import { useState } from "react";
import Link from "next/link";
import useProducts from "@/stores/productsStore";

//disable button when no results
//make links loops
//make cart a preview ting and on preview click it routes
//onmouseenter could be buggy for phones

function Header() {
    const [search, setSearch] = useState<string>("")
    const productsCount = useProducts(state=> state.products.length)
    const [shoppingCartPreview, setShoppingCartPreview] = useState<boolean>(false)

  return (
    <header className="w-screen h-[15vh] bg-foreground text-primary-foreground flex items-center justify-between">
      <div className="w-2/3 h-full flex justify-center items-center relative">
        <Input
          className="md:w-1/3 w-4/5 pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search.length > 0 && (
          <button
            aria-label="Search for Products"
            className="absolute md:right-[calc(33.333%+8px)] right-[calc(10%+8px)]"
          >
            <Search aria-label="Search" />
          </button>
        )}
      </div>
      <div className="w-1/3 h-full flex justify-evenly items-center">
        <Link href="/cart" className="relative" aria-label="show shopping cart" onMouseLeave={()=>setShoppingCartPreview(false)} onMouseEnter={()=>setShoppingCartPreview(true)}>
          <ShoppingCart />
          {productsCount > 0 && (
            <div className="absolute bg-red-500 rounded-full w-7 p-2 h-7 flex justify-center items-center -top-4 -right-4">
              {productsCount > 99 ? "99+" : productsCount}
            </div>
          )}
        </Link>
        <Link href="/user" aria-label="go to user account">
          <User />
        </Link>
        <Link href="/settings" aria-label="go to settings">
          <Settings2 />
        </Link>
      </div>
    </header>
  );
}

export default Header