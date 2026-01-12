import { Cart } from "@/types/types";

function SummarySectionContent({
  totalItems,
  cart,
}: {
  totalItems: number;
  cart: Cart;
}) {
  return (
    <div className="w-full h-2/3 flex flex-col justify-evenly items-start ">
      <p className="self-center text-center text-white md:text-lg font-semibold">
        Total Items: {totalItems}
      </p>
      {cart?.items.map((item) => (
        <p className="text-white/70" key={item.id}>
          Item: {item.quantity}x {item.product.name} {item.total}{" "}
          {item.product.currency}
        </p>
      ))}
      <p className="self-center text-center text-white md:text-lg font-semibold">
        Total Price: {cart?.total}
        {cart?.items[0]?.product.currency}
      </p>
    </div>
  );
}

export default SummarySectionContent;
