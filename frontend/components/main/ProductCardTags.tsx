import { X } from "lucide-react";
import ProductTag from "./ProductTag";

type ProductCardTagsProps = {
    stock_quantity: number;
    sale_price: number | null
    published_at:Date | null
};

function ProductCardTags({stock_quantity, sale_price, published_at}:ProductCardTagsProps) {
  return (
    <>
      {stock_quantity === 0 && (
        <X className="absolute w-full h-full text-black" />
      )}
      {stock_quantity === 0 && (
        <ProductTag
          type="Sold out"
          styles="absolute top-4 right-0  rounded-l-lg"
        />
      )}
      {stock_quantity !== 0 && sale_price && (
        <ProductTag
          type="Sale"
          styles="absolute top-4 right-0 w-10 rounded-l-lg"
        />
      )}
      {published_at &&
        new Date(published_at) >=
          new Date(new Date().setDate(new Date().getDate() - 7)) && (
          <ProductTag
            type="New"
            styles="absolute top-12 right-0 w-10 rounded-l-lg"
          />
        )}
    </>
  );
}

export default ProductCardTags