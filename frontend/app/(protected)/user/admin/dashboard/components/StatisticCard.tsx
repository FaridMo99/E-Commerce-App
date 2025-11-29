import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

type StatisticCardProps = {
  title: string
  isError: boolean
  isLoading: boolean,
  statistic: string | number | undefined
};

function StatisticCard({
  title,
  isError,
  isLoading,
  statistic,
}: StatisticCardProps) {

  const sharedSizes = "w-[20%] h-40 my-10"

  if (isLoading) return <Skeleton className={sharedSizes} />;
  
  return (
    <Card className={`bg-backgroundBright border ${sharedSizes}`}>
      <CardHeader className="font-semibold text-lg">{title}</CardHeader>
      <CardContent className="w-full flex justify-center items-center font-extrabold text-2xl text-white">
        {!isLoading && statistic}
        {isError && !isLoading && <p>Something went wrong...</p>}
      </CardContent>
    </Card>
  );
}

export default StatisticCard;