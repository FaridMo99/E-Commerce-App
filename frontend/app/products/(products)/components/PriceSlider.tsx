"use client";
import React from "react";
import { Slider } from "@/components/ui/slider";
import { CurrencyISO } from "@/types/types";
import PriceSliderInput from "./PriceSliderInput";

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

      <div className="flex flex-row sm:flex-col items-start gap-3">
        <PriceSliderInput
          label="Min"
          index={0}
          value={value[0]}
          currency={currency}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCommit={() => onCommit(value)}
        />
        <span className="text-white/20 sm:pl-12">—</span>
        <PriceSliderInput
          label="Max"
          index={1}
          value={value[1]}
          currency={currency}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCommit={() => onCommit(value)}
        />
      </div>
    </div>
  );
}

export default PriceSlider;
