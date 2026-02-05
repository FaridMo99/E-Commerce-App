import { Product } from "@/types/types";
import AddToCartBox from "./AddToCartBox";
import Price from "@/components/main/product/Price";

function AddingPart({ product }: { product: Product }) {

  return (
    <div className="bg-backgroundBright sm:w-30 md:w-60 rounded sm:h-80 h-120 flex-1 px-8 sm:m-0 m-12 sm:py-0 py-4 flex flex-col justify-evenly items-center">
      <Price
        styles="items-end flex-col-reverse sm:flex-col"
        price={product.price}
        sale_price={product.sale_price}
        currency={product.currency}
      />

      <p className="text-center">Available: {product.stock_quantity}</p>
      <AddToCartBox
        stockAmount={product.stock_quantity}
        productId={product.id}
      />
    </div>
  );
}

export default AddingPart;
