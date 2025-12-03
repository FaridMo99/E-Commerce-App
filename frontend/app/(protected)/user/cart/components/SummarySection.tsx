
import StripeCheckoutButton from './StripeCheckoutButton';
import { Cart } from '@/types/types';

function SummarySection({ cart }: { cart: Cart }) {
      const totalItems = cart?.items.reduce((acc, item) => {
        return acc + item.quantity;
      }, 0);

    
  return (
    <section className="w-1/3 h-full overflow-scroll border-l flex flex-col items-center justify-evenly">
      <div className="w-full h-2/3 flex flex-col justify-evenly items-start pl-8">
        <p className="self-center text-white text-lg font-semibold">
          Total Items: {totalItems}
        </p>
        {cart?.items.map((item) => (
          <p className="text-white/70" key={item.id}>
            Item: {item.quantity}x {item.product.name} {item.total}{" "}
            {item.product.currency}
          </p>
        ))}
        <p className="self-center text-white text-lg font-semibold">
          Total Price:{cart?.total}
          {cart?.items[0]?.product.currency}
        </p>
      </div>
      <StripeCheckoutButton disabled={totalItems === 0} />
    </section>
  );
}

export default SummarySection