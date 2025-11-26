"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DailyRevenue } from "@monorepo/shared"

export const description = "An area chart with gradient fill"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-foreground)",
  },
} satisfies ChartConfig;

export function ChartAreaGradient({ dailyRevenue }: { dailyRevenue: DailyRevenue[] }) {

    const chartData =
      dailyRevenue.length > 0 ? dailyRevenue : [{ day: "N/A", revenue: 0 }];

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full bg-backgroundBright rounded-lg border">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid stroke="var(--color-background)" vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient
            id="area-chart-09"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor="var(--color-foreground)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-foreground)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          dataKey="revenue"
          type="natural"
          fill="var(--color-chart-1)"
          fillOpacity={0.4}
          stroke="var(--color-foreground)"
        />
      </AreaChart>
    </ChartContainer>
  );
}