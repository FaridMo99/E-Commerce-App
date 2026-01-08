import { CartItem } from '@/types/types'
import ImageWithPlaceholder from '@/components/main/product/ImageWithPlaceholder';
import ItemInfo from './ItemInfo';
import ItemContent from './ItemContent';

function Item({item}:{item:CartItem}) {
  return (
    <div className="w-full relative flex justify-center border-y items-center h-30">
      <ImageWithPlaceholder
        imageUrls={item.product.imageUrls}
        width="w-1/3"
        height="h-full"
      />
      <div className="w-2/3 h-full flex justify-center items-center">
      <ItemContent item={item} />
      <ItemInfo item={item} />
      </div>
    </div>
  );
}

export default Item