import { Product } from "@/types/types";
import RatingPreview from "../product/Rating";

function SearchlistItemHeader({ product }: { product: Product }) {
  return (
    <div className="flex justify-between items-center w-full gap-2">
      <p className="font-bold truncate flex-1 min-w-0">{product.name}</p>
      <div className="shrink-0">
        <RatingPreview size={10} rating={product.averageRating} />
      </div>
    </div>
  );
}

export default SearchlistItemHeader;
