import { ChartAreaGradient } from "@/components/ui/shadcn-io/area-chart-09"
import { AdminRevenue } from "@/types/types"
import { UseQueryResult } from "@tanstack/react-query"

type RevenueChartProps = {
    fetchResult: UseQueryResult<AdminRevenue, Error>
}

function RevenueChart({fetchResult}:RevenueChartProps) {
    
    if (!fetchResult.isLoading && !fetchResult.data) return <p>Something went wrong...</p>
    
  return (
    <ChartAreaGradient dailyRevenue={fetchResult.data ?? []} isLoading={fetchResult.isLoading} />
  )
}

export default RevenueChart