import CurrencySymbol from "@/components/main/CurrencySymbol";
import { Slider } from "@/components/ui/slider";
import { CurrencyISO } from "@/types/types";
import { useState } from "react";

type PriceSliderProps = {
    currency: CurrencyISO;
    min: number;
    max: number;
    valueChangeHandler:(value:[number,number])=>void
}

function PriceSlider({ currency, min, max, valueChangeHandler }: PriceSliderProps) {
    const [priceLimits, setPriceLimits] = useState<[number, number]>([min, max])
    
  return (
    <div className=" space-y-3">
      <Slider
        value={priceLimits}
        onValueChange={valueChangeHandler}
        max={max}
        min={min}
        step={1}
      />
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <p>
          Min: {Math.floor(min)}<CurrencySymbol currency={currency} />
        </p>
        <p>
          Max: {Math.ceil(max)}<CurrencySymbol currency={currency} />
        </p>
      </div>
    </div>
  );
}

export default PriceSlider