import StripeCheckoutButton from "./StripeCheckoutButton";
import { Cart } from "@/types/types";
import SummarySectionContent from "./SummarySectionContent";

function SummarySection({ cart }: { cart: Cart }) {
  const totalItems = cart?.items.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);

  return (
    <section className="w-1/3 min-h-full overflow-scroll text-wrap wrap-break-word border-l flex flex-col items-center justify-evenly p-2 px-4">
      <SummarySectionContent totalItems={totalItems} cart={cart} />
      <StripeCheckoutButton disabled={totalItems === 0} />
    </section>
  );
}

export default SummarySection;
