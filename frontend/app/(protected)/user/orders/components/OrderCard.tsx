import { Order } from '@/types/types'
import OrderItem from './OrderItem';


function OrderCard({ order }: { order: Order }) {
      const formattedDate = new Date(order.ordered_at).toLocaleDateString(
        "en-US"
      );

  return (
    <div className="mb-4 flex flex-col h-50 w-full">
      <div className=' w-full h-1/3'>
        <p>{order.currency}</p>
        <p>{formattedDate}</p>
        <p>{order.payment?.method}</p>
        <p>{order.payment?.status}</p>
        <p>{order.shipping_address}</p>
        <p>{order.status}</p>
        <p>{order.total_amount}</p>
      </div>
      <div className='w-full h-2/3'>
        {order.items.map((item) => (
          <OrderItem key={item.product.id} item={item.product} />
        ))}
      </div>
    </div>
  );
}

export default OrderCard