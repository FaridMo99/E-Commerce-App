import { Product } from '@/types/types'

import Price from '../product/Price';

function SearchlistItemBody({product}:{product:Product}) {
  return (
    <div className="flex flex-col flex-1 justify-between mt-1 min-w-0">
      <p className="text-black/50 text-sm line-clamp-3 wrap-break-word">
        {product.description}
      </p>
      <Price
        styles="self-end"
        price={product.price}
        sale_price={product.sale_price}
        currency={product.currency}
      />
    </div>
  );
}

export default SearchlistItemBody