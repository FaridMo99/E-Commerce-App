import Price from "@/components/main/product/Price";
import RatingPreview from "@/components/main/product/Rating";
import { ProductViewProps } from "./ProductView";

function ProductViewInfo({ product }: ProductViewProps) {
  return (
    <div className="h-full flex flex-col justify-around items-end w-1/3">
      <RatingPreview
        size={14}
        rating={product.averageRating}
        reviewsAmount={product._count.reviews}
      />
      <Price
        price={product.price}
        sale_price={product.sale_price}
        currency={product.currency}
        styles="items-end w-full"
      />
    </div>
  );
}

export default ProductViewInfo;
