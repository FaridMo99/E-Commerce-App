import { Search } from "lucide-react";
import type { Product } from "../../types/types";
import Link from "next/link";
import ImageWithPlaceholder from "./ImageWithPlaceholder";
import RatingPreview from "./Rating";
import Price from "./Price";

function Searchlist({ products }: { products: Product[] }) {

  return (
    <div className="bg-white overflow-x-clip overflow-y-scroll w-full max-h-100 rounded-b-lg border border-foreground text-black">
      {products?.map((product) => (
        <Link
          key={product.id}
          className="w-full"
          href={`/products/${product.id}`}
        >
          <li
            key={product.id}
            className="w-full flex h-30 justify-around items-center bg-foreground hover:bg-foreground/50"
          >
            <ImageWithPlaceholder
              imageUrls={product.imageUrls}
              width="w-20"
              height="h-20"
            />
            <div className="w-1/3 h-full flex flex-col justify-evenly items-start truncate">
              <p>{product.name}</p>
              <p className="text-black/50">{product.description}</p>
            </div>
            <div className="w-1/3 h-full flex truncate flex-col justify-evenly items-start">
              <RatingPreview rating={product.averageRating} />
              <Price
                price={product.price}
                sale_price={product.sale_price}
                currency={product.currency}
              />
            </div>
          </li>
        </Link>
      ))}
      {products.length === 0 && (
        <div className="w-full h-[10vh] flex justify-center items-center text-gray-500">
          <p>No Products Found</p>
          <Search className="ml-2 text-foreground" />
        </div>
      )}
    </div>
  );
}

export default Searchlist;
