import { ChartAreaGradient } from "@/components/ui/shadcn-io/area-chart-09"
import { AdminRevenue } from "@/types/types"
import { UseQueryResult } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

type RevenueChartProps = {
    fetchResult: UseQueryResult<AdminRevenue, Error>
}

function RevenueChart({fetchResult}:RevenueChartProps) {
    
    if (fetchResult.isLoading) return <Loader2 className="animate-spin" size={80}/>
    if (fetchResult.isError || !fetchResult.data) return <p>Something went wrong...</p>
    
  return (
    <ChartAreaGradient dailyRevenue={fetchResult.data}/>
  )
}

export default RevenueChart