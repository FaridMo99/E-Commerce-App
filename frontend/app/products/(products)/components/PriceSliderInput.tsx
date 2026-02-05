"use client"
import CurrencySymbol from "@/components/main/product/CurrencySymbol";
import { Input } from "@/components/ui/input";
import { CurrencyISO } from "@/types/types";

type PriceSliderInputProps = {
  label: string;
  index: number; 
  value: number; 
  currency: CurrencyISO;
  onChange: (index: number, newValue: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCommit: () => void;
};

function PriceSliderInput({
  label,
  index,
  value,
  currency,
  onChange,
  onKeyDown,
  onCommit,
}: PriceSliderInputProps) {
  return (
    <div className="relative w-30">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] uppercase text-white/40 pointer-events-none">
        {label}
      </span>
      <Input
        type="number"
        className="pl-9 pr-7 h-9 bg-white/5 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        value={value || ""}
        onChange={(e) => onChange(index, e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onCommit}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs">
        <CurrencySymbol currency={currency} />
      </div>
    </div>
  );
}

export default PriceSliderInput;