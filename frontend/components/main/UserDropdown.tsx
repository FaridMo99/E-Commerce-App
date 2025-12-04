"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/stores/authStore";
import { Route } from "@/types/types";
import {
  User,
  ShoppingCart,
  PackageSearch,
  MessageSquare,
  Bookmark,
  UserStar,
} from "lucide-react";
import Link from "next/link";


const routes: Route[] = [
  { link: "/user/admin/dashboard", text: "Admin", icon: UserStar },
  { link: "/user", text: "My Profile", icon: User },
  { link: "/user/cart", text: "Shopping Cart", icon: ShoppingCart },
  { link: "/user/orders", text: "Orders", icon: PackageSearch },
  { link: "/user/favorites", text: "Favorites", icon: Bookmark },
  { link: "/user/reviews", text: "Product Reviews", icon: MessageSquare },
];


export default function UserDropdown() {
  const role = useAuth(state => state.user?.role)
  

    const filteredRoutes = routes.filter((route) =>
      route.text === "Admin" ? role === "ADMIN" : true
    );
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="Show User"
          className="hidden md:block"
          aria-label="Show User"
        >
          <User />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-foreground text-white">
        <DropdownMenuLabel className="flex justify-center items-center">
          User Infos
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredRoutes.map((route) => (
          <DropdownMenuItem asChild key={route.link}>
            <Link
              href={route.link}
              className="flex cursor-pointer justify-between w-full items-center gap-2"
            >
              <route.icon />
              <span>{route.text}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
