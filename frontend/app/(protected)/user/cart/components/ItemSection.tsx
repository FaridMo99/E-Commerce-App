import { CartItem } from '@/types/types';
import Item from './Item';

function ItemSection({items}:{items:CartItem[]}) {
  return (
    <section className="w-2/3 h-full overflow-scroll flex items-center flex-col">
      {items.map((item) => (
        <Item key={item.id} item={item} />
      ))}
      {items?.length === 0 && (
        <p className=" self-center mt-40 text-white text-2xl">
          Pretty empty in here...
        </p>
      )}
    </section>
  );
}

export default ItemSection