"use client";

import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import useAuth from "@/stores/authStore";
import LogoutButton from "./LogoutButton";
import MobileUserDopdown from "./MobileUserDopdown";


//user routes missing
export function MobileNavigation() {
  const accessToken = useAuth(state=>state.accessToken)
  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
  ];

  return (
    <Sheet>
      <SheetTrigger className="block md:hidden" asChild>
        <button aria-label="open menu">
          <MenuIcon size={40} />
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-4 px-4">
          {links.map((link) => (
            <SheetClose key={link.href} asChild>
              <Link
                href={link.href}
                className="block py-2 px-4 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                {link.label}
              </Link>
            </SheetClose>
          ))}

          {accessToken ? (
            <>
              <SheetClose
                asChild
                className="block py-2 px-4 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <MobileUserDopdown/>
              </SheetClose>
              <SheetClose
                asChild
                className="block py-2 px-4 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <Link href="/user/cart">Cart</Link>
              </SheetClose>
              <SheetClose
                asChild
                className="block py-2 px-4 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <LogoutButton text accessToken={accessToken} />
              </SheetClose>
            </>
          ) : (
            <SheetClose asChild>
              <Link
                href="login"
                className="block py-2 px-4 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                Login
              </Link>
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
