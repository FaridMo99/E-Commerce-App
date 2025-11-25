"use client"
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
import Price from "./Price";
import RatingPreview from "./Rating";
import Link from "next/link";
import ImageWithPlaceholder from "./ImageWithPlaceholder";


function ShoppingCartDropdown({ cart }: { cart: Cart | null }) {
  const itemsLength = cart?.items.length;
  const accessToken = useAuth(state=>state.accessToken);

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
        <DropdownMenuLabel className="flex justify-around items-center">Items in Cart <Link href="/user/cart" className="text-blue-500 underline">Go To Cart</Link></DropdownMenuLabel>
        <DropdownMenuSeparator />
        {itemsLength && itemsLength > 0 ? (
          cart?.items.map((item) => (
            <DropdownMenuItem className="justify-between" key={item.id}>
              <ImageWithPlaceholder
                src={item.product.imageUrls[0]}
                width="w-1/3"
                height="h-full"
              />
              <div className="w-2/3 h-full flex justify-center">
                <div className="h-full flex flex-col w-2/3 pl-2">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="text-lg font-bold mt-4 truncate"
                  >
                    {item.product.name}
                  </Link>
                  <RatingPreview
                    size={10}
                    rating={item.product.averageRating}
                    styles="items-start"
                  />
                </div>
                <div className="h-full flex flex-col justify-around items-end w-1/3 p-2">
                  <p>Amount: {item.quantity}</p>
                  <Price
                    price={item.product.price}
                    sale_price={item.product.sale_price}
                    currency={item.product.currency}
                    styles="items-end"
                  />
                </div>
              </div>
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
