import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";
import {
  User,
  ShoppingCart,
  PackageSearch,
  Settings,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import Link from "next/link";

type UserRoute = { link: string; text: string; icon: LucideIcon };

const routes: UserRoute[] = [
  { link: "/user", text: "My Profile", icon: User },
  { link: "/user/cart", text: "Shopping Cart", icon: ShoppingCart },
  { link: "/user/orders", text: "Orders", icon: PackageSearch },
  { link: "/user/settings", text: "Settings", icon: Settings },
  { link: "/user/favorites", text: "Favorites", icon: Bookmark },
  { link: "/user/reviews", text: "Product Reviews", icon: MessageSquare },
];

//make the links marked when on the corresponding route
//maybe add admin routes or give admin seperate sidebar
export default function UserDropdown() {
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
        <DropdownMenuLabel className="flex justify-center items-center">User Infos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {routes.map((route) => (
          <DropdownMenuItem key={route.link}>
            <Link
              href={route.link}
              className="flex justify-between w-full items-center gap-2"
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
