import RatingPreview from '@/components/main/product/Rating';
import { CartItem } from '@/types/types'
import Link from 'next/link';

function ItemContent({item}:{item:CartItem}) {
  return (
    <div className="h-full flex flex-col w-2/3 pl-2">
      <Link
        href={`/products/${item.product.id}`}
        className="text-lg font-bold mt-4 truncate"
      >
        {item.product.name}
      </Link>
      <RatingPreview
        size={10}
        rating={item.product.averageRating}
        styles="items-start"
      />
      <p className=" text-white wrap-anywhere truncate">
        {item.product.description}
      </p>
    </div>
  );
}

export default ItemContent