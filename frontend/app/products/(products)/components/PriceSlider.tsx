"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import CurrencySymbol from "@/components/main/product/CurrencySymbol";
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
  const handleChange = (index: number, newValue: string) => {
    if (newValue === "") {
      const updatedValues: [number, number] = [...value];
      updatedValues[index] = 0;
      onDrag(updatedValues);
      return;
    }

    let num = Number(newValue);
    if (num < min) num = min;
    if (num > max) num = max;

    const updatedValues: [number, number] = [...value];
    updatedValues[index] = num;
    onDrag(updatedValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onCommit(value);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="space-y-4">
      <Slider
        value={value}
        onValueChange={onDrag}
        onValueCommit={onCommit}
        max={max}
        min={min}
        step={1}
        className="cursor-pointer"
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] uppercase text-white/40 pointer-events-none">
            Min
          </span>
          <Input
            type="number"
            className="pl-9 pr-7 h-9 text-xs bg-white/5 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={value[0] || ""}
            onChange={(e) => handleChange(0, e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onCommit(value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs">
            <CurrencySymbol currency={currency} />
          </div>
        </div>

        <span className="text-white/20">—</span>

        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] uppercase text-white/40 pointer-events-none">
            Max
          </span>
          <Input
            type="number"
            className="pl-9 pr-7 h-9 text-xs bg-white/5 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={value[1] || ""}
            onChange={(e) => handleChange(1, e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onCommit(value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs">
            <CurrencySymbol currency={currency} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceSlider;
