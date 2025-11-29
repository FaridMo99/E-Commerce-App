"use client";

import * as React from "react";
import { subDays, subMonths, subYears } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEFRAMES = [
  { label: "All Time", value: "all" },
  { label: "1 Day", value: "1d" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "1 Year", value: "1y" },
];

export default function ChangeTimeframeDropdown({
  onChangeTimeframe,
}: {
  onChangeTimeframe: (range: { from?: Date; to?: Date }) => void;
}) {
  const [selected, setSelected] = React.useState("7d");

  const handleChange = (value: string) => {
    setSelected(value);

    if (value === "all") {
      onChangeTimeframe({ from: undefined, to: undefined });
      return;
    }

    const to = new Date();
    let from: Date;

    switch (value) {
      case "1d":
        from = subDays(to, 1);
        break;
      case "7d":
        from = subDays(to, 7);
        break;
      case "30d":
        from = subMonths(to, 1);
        break;
      case "1y":
        from = subYears(to, 1);
        break;
      default:
        from = subDays(to, 7);
    }

    onChangeTimeframe({ from, to });
  };

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className="border bg-backgroundBright self-end my-4">
        <SelectValue placeholder="Select timeframe" />
      </SelectTrigger>

      <SelectContent className="bg-backgroundBright">
        {TIMEFRAMES.map((tf) => (
          <SelectItem key={tf.value} value={tf.value}>
            {tf.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
