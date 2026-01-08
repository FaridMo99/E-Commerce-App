import { Product } from '@/types/types'
import AddToCartBox from './AddToCartBox';
import Price from '@/components/main/product/Price';

function AddingPart({product}:{product:Product}) {
  return (
    <div className="bg-backgroundBright md:w-[17vw] w-[30vw] rounded h-80 px-8 flex flex-col justify-around items-center">
      <Price
        styles="items-end"
        price={product.price}
        sale_price={product.sale_price}
        currency={product.currency}
      />

      <p className='text-center'>Available: {product.stock_quantity}</p>
      <AddToCartBox
        stockAmount={product.stock_quantity}
        productId={product.id}
      />
    </div>
  );
}

export default AddingPart