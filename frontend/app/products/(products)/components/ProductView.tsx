import CurrencySymbol from "@/components/main/CurrencySymbol";
import { Product } from "@/types/types";
import Link from "next/link";

type ProductViewProps = {
  product: Product;
};

//tags for onsale, trending,favorited,new, recently viewed, probably have to save these infos in global state
function ProductView({ product }: ProductViewProps) {

  return (
    <Link
      href={`/products/${product.id}`}
      className="w-[50vw] bg-backgroundBright flex justify-center items-center h-[20vh] border-y border-y-background pr-4"
    >
      <img src={product.imageUrls[0]} className="h-full w-1/3" />
      <div className="h-full w-2/3 flex px-2 py-4 justify-evenly">
        <h2 className="text-lg font-bold">{product.name}</h2>
        <p>{product.description}</p>
      </div>
      <p className="flex items-center">
        {product.sale_price ?? product.price}
        <CurrencySymbol currency={product.currency} />
      </p>
    </Link>
  );
}

export default ProductView;
