
import ItemCountDot from "./ItemCountDot";
import { ShoppingCart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/stores/authStore";
import { Cart } from "@/types/types";

//check logic if not authed to log in then
//check how to fetch, maybe after layout just the count and on click here the real items for performance
function ShoppingCartDropdown({ cart }: { cart: Cart | null }) {
  const itemsLength = cart?.items.length;
  const accessToken = useAuth.getState().accessToken;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="show shopping cart"
          className="relative hidden md:block"
          aria-label="show shopping cart"
        >
          <ShoppingCart />
          <ItemCountDot count={itemsLength ?? 0} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-foreground text-white">
        <DropdownMenuLabel>Items in Cart</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {itemsLength && itemsLength > 0 ? (
          cart?.items.map((item) => (
            <DropdownMenuItem
              className="justify-between"
              key={item.id}
            >
              {item.product.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="hover:bg-transparent hover:text-inherit focus:bg-transparent focus:text-inherit">
            {accessToken
              ? "Pretty empty in here..."
              : "You have to be logged in to see your Items"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ShoppingCartDropdown;
