import ImageWithPlaceholder from "../product/ImageWithPlaceholder";
import Link from "next/link";
import { Product } from "@/types/types";
import SearchlistItemBody from "./SearchlistItemBody";
import SearchlistItemHeader from "./SearchlistItemHeader";

function SearchlistItem({ product }: { product: Product }) {
  return (
    <Link className="w-full" href={`/products/${product.id}`}>
      <li className="w-full bg-foreground flex h-40 justify-evenly items-center hover:bg-foreground/50">
        <ImageWithPlaceholder
          imageUrls={product.imageUrls}
          width="w-1/8 mx-2"
          height="h-1/2"
        />
        <div className="h-full flex p-3 flex-1 flex-col min-w-0">
          <SearchlistItemHeader product={product} />
          <SearchlistItemBody product={product} />
        </div>
      </li>
    </Link>
  );
}

export default SearchlistItem;
