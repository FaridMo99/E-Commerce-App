import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  return (
    <Card className="bg-backgroundBright border w-[20%] h-40 my-10">
      <CardHeader className="font-semibold text-lg">{title}</CardHeader>
      <CardContent className="w-full flex justify-center items-center font-extrabold text-2xl text-white">
        {isLoading ? (
          <Loader2 className="animate-spin" size={40} />
        ) : isError || statistic === undefined ? (
          <p>Something went wrong...</p>
        ) : (
          statistic
        )}
      </CardContent>
    </Card>
  );
}

export default StatisticCard;