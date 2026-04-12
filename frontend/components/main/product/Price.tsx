import { CurrencyISO } from "@/types/types";
import CurrencySymbol from "./CurrencySymbol";

type PriceProps = {
  price: number;
  sale_price: number | undefined;
  currency: CurrencyISO;
  styles?: string;
};

function Price({ price, sale_price, currency, styles }: PriceProps) {
  return (
    <div className={`flex flex-col ${styles}`}>
      {sale_price && (
        <p className="flex items-center relative text-gray-400 scale-75">
          Previous:
          <span className="flex items-center">
            {price}
            <CurrencySymbol currency={currency} />
          </span>
          <span className="w-full h-full absolute top-0 left-0 break-after-all flex justify-center items-center">
            <span className="h-px bg-gray-400 w-full" />
          </span>
        </p>
      )}
      <p className="flex items-center">
        {sale_price ? sale_price : price}
        <CurrencySymbol currency={currency} />
      </p>
    </div>
  );
}

export default Price;
