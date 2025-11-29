import { CartItem } from '@/types/types'
import RemoveItemButton from './RemoveItemButton'
import RatingPreview from '@/components/main/Rating'
import ImageWithPlaceholder from '@/components/main/ImageWithPlaceholder'
import Link from 'next/link'
import Price from '@/components/main/Price'

function Item({item}:{item:CartItem}) {
  return (
    <div className="w-full relative flex justify-center border-y items-center h-30">
      <ImageWithPlaceholder
        imageUrls={item.product.imageUrls}
        width="w-1/3"
        height="h-full"
      />
      <div className="w-2/3 h-full flex justify-center items-center">
        <div className="h-full flex flex-col w-2/3 pl-2">
          <Link
            href={`/products/${item.product.id}`}
            className="text-lg font-bold mt-4 truncate"
          >
            {item.product.name}
          </Link>
          <RatingPreview size={10} rating={item.product.averageRating} styles='items-start'/>
          <p className=" text-white wrap-anywhere truncate">
            {item.product.description}
          </p>
        </div>
        <div className="h-full flex flex-col justify-around items-end w-1/3 p-2">
          <p>Amount: {item.quantity}</p>
                            <div className="flex ellipsis truncate">

          <Price
            price={item.product.price}
            sale_price={item.product.sale_price}
            currency={item.product.currency}
            styles="items-end w-full"
            />
            </div>
          <RemoveItemButton itemId={item.id} />
        </div>
      </div>
    </div>
  );
}

export default Item