import ImageWithPlaceholder from "@/components/main/product/ImageWithPlaceholder";
import ProductCardTags from "@/components/main/product/ProductCardTags";
import { Product } from "@/types/types";
import Link from "next/link";
import ProductViewInfo from "./ProductViewInfo";
import ProductViewContent from "./ProductViewContent";

export type ProductViewProps = {
  product: Product;
};


function ProductView({ product }: ProductViewProps) {

  return (
    <Link
      href={`/products/${product.id}`}
      className={`w-[65vw] mb-2 bg-backgroundBright relative flex justify-center items-center h-[20vh] border-y border-y-background pr-4 z-10 ${product.stock_quantity === 0 ? "bg-muted/50" : ""}`}
    >
      <ProductCardTags
        position="left"
        sale_price={product.sale_price}
        stock_quantity={product.stock_quantity}
        published_at={product.published_at}
      />
      <ImageWithPlaceholder
        imageUrls={product.imageUrls}
        width="w-1/3"
        height="h-full"
      />
      <div className="w-2/3 h-full flex justify-center items-center">
        <ProductViewContent product={product} />
        <ProductViewInfo product={product} />
      </div>
    </Link>
  );
}

export default ProductView;
