"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  formatISO,
  subDays,
  subMonths,
  subYears,
  differenceInDays,
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEFRAMES = [
  { label: "1 Day", value: "1d" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "1 Year", value: "1y" },
  { label: "All Time", value: "all" },
];

export default function ChangeTimeframeDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFrom = searchParams.get("from");
  const currentTo = searchParams.get("to");

  const initialValue = React.useMemo(() => {
    if (!currentFrom || !currentTo) return "all";

    const fromDate = new Date(currentFrom);
    const toDate = new Date(currentTo);
    const diff = differenceInDays(toDate, fromDate);

    if (diff <= 1) return "1d";
    if (diff <= 7) return "7d";
    if (diff <= 30) return "30d";
    return "1y";
  }, [currentFrom, currentTo]);

  const [selected, setSelected] = React.useState(initialValue);

  const handleChange = (value: string) => {
    setSelected(value);

    if (value === "all") {
      router.push("?");
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
        return;
    }

    const params = new URLSearchParams();
    params.set("from", formatISO(from));
    params.set("to", formatISO(to));

    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className="w-[150px] self-end bg-backgroundBright">
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
