import CurrencySymbol from "@/components/main/CurrencySymbol";
import ImageWithPlaceholder from "@/components/main/ImageWithPlaceholder";
import Price from "@/components/main/Price";
import ProductCardTags from "@/components/main/ProductCardTags";
import RatingPreview from "@/components/main/Rating";
import { Product } from "@/types/types";
import Link from "next/link";

type ProductViewProps = {
  product: Product;
};


function ProductView({ product }: ProductViewProps) {

  return (
    <Link
      href={`/products/${product.id}`}
      className="w-[65vw] mb-2 bg-backgroundBright relative flex justify-center items-center h-[20vh] border-y border-y-background pr-4"
    >
      <ProductCardTags position="left" sale_price={product.sale_price} stock_quantity={product.stock_quantity} published_at={product.published_at}/>
      <ImageWithPlaceholder src={product.imageUrls[0]} width="w-1/3" height="h-full"/>
      <div className="w-2/3 h-full flex justify-center items-center">
        <div className="h-full flex flex-col w-2/3 pl-2">
          <h2 className="text-lg font-bold mt-4 truncate">{product.name}</h2>
          <p className=" text-white wrap-anywhere truncate">
            {product.description}
          </p>
        </div>
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
      </div>
    </Link>
  );
}

export default ProductView;
