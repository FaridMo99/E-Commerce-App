import Price from "@/components/main/product/Price";
import RemoveItemButton from "./RemoveItemButton";
import { CartItem } from "@/types/types";

function ItemInfo({ item }: { item: CartItem }) {
  return (
    <div className="h-full flex flex-col justify-around items-end w-1/3 p-2">
      <p>{item.quantity}x</p>
      <div className="flex ellipsis truncate">
        <Price
          price={item.product.price}
          sale_price={item.product.sale_price}
          currency={item.product.currency}
          styles="items-end w-full"
        />
      </div>
      <RemoveItemButton itemId={item.id} />
    </div>
  );
}

export default ItemInfo;
