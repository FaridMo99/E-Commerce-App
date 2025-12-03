import CurrencySymbol from "@/components/main/product/CurrencySymbol";
import { Slider } from "@/components/ui/slider";
import { CurrencyISO } from "@/types/types";

type PriceSliderProps = {
  currency: CurrencyISO;
  min: number;
  max: number;
  value: [number, number];
  onDrag: (value: [number, number]) => void;
  onCommit: (value: [number, number]) => void;
};

function PriceSlider({
  currency,
  min,
  max,
  onDrag,
  onCommit,
  value,
}: PriceSliderProps) {
  return (
    <div className=" space-y-3">
      <Slider
        value={value}
        onValueChange={onDrag}
        onValueCommit={onCommit}
        max={max}
        min={min}
        step={1}
      />
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <p>
          Min: {value[0]}
          <CurrencySymbol currency={currency} />
        </p>
        <p>
          Max: {value[1]}
          <CurrencySymbol currency={currency} />
        </p>
      </div>
    </div>
  );
}

export default PriceSlider;
