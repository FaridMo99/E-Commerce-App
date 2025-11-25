import { CurrencyISO } from '@/types/types'
import CurrencySymbol from './CurrencySymbol'

type PriceProps = {
    price: number
    sale_price: number | undefined
  currency: CurrencyISO
    styles?:string
}


function Price({price,sale_price,currency, styles}:PriceProps) {
    return (
      <div className={`flex flex-col ${styles}`}>
        {sale_price && (
          <p className="flex items-center text-gray-400 scale-75">
            Previous: {price}
            <CurrencySymbol currency={currency} />
            <span className="absolute inset-0 top-1/2 h-px bg-gray-400 w-full" />
          </p>
        )}
        <p className="flex items-center">
          {sale_price ? sale_price : price}
          <CurrencySymbol currency={currency} />
        </p>
      </div>
    );
}

export default Price