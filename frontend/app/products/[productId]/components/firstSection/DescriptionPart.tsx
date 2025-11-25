import FavoriteProduct from '@/components/main/FavoriteProduct';
import RatingPreview from '@/components/main/Rating';
import { Product } from '@/types/types'
import Link from 'next/link';

function DescriptionPart({product}:{product:Product}) {
  return (
    <div className="flex flex-col ml-4">
      <h1 className="text-4xl font-bold">
        <span className="mr-2">{product.name}</span>{" "}
        <FavoriteProduct productId={product.id} />
      </h1>
      <Link className="self-start" href="#reviews">
        <RatingPreview
          styles="self-start mt-2 mb-6"
          size={15}
          rating={product.averageRating}
        />
      </Link>
      <h2 className="font-medium text-lg text-white wrap-break-word overflow-y-scroll">
        {product.description}
      </h2>
    </div>
  );
}

export default DescriptionPart