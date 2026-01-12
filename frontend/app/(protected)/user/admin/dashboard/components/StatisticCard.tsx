import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatisticCardProps = {
  title: string;
  isError: boolean;
  isLoading: boolean;
  statistic: string | number | undefined;
};

function StatisticCard({
  title,
  isError,
  isLoading,
  statistic,
}: StatisticCardProps) {
  const sharedSizes = "md:w-[20%] w-[30%] min-w-30 h-40 my-10";

  if (isLoading) return <Skeleton className={sharedSizes} />;

  return (
    <Card className={`bg-backgroundBright border ${sharedSizes}`}>
      <CardHeader className="font-extrabold text-lg text-center">
        {title}
      </CardHeader>
      <CardContent className="w-full flex justify-center items-center font-extrabold text-2xl text-white text-center">
        {!isLoading && <p className="text-center">{statistic}</p>}
        {isError && !isLoading && <p>Something went wrong...</p>}
      </CardContent>
    </Card>
  );
}

export default StatisticCard;
