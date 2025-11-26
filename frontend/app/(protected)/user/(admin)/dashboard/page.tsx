"use client"
import {getTopsellers,getNewUsers,getRevenue} from "@/lib/queries/client/adminQueries";
import RevenueChart from "./components/RevenueChart"
import useAuth from "@/stores/authStore";
import { useQueries } from "@tanstack/react-query";
import TopsellersCarousel from "./components/TopsellersCarousel";
import ChangeTimeframeDropdown from "./components/ChangeTimeframeDropdown";
import { useSearchParams } from "next/navigation";
import StatisticCard from "./components/StatisticCard";


function Page() {
  const accessToken = useAuth((state) => state.accessToken);

  const searchParams = useSearchParams()
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : undefined;
  const to = toParam ? new Date(toParam) : undefined;


  const [revenueResults, topsellersResults, usersResults] = useQueries({
    queries: [
      {
        queryKey: ["get revenue", from, to],
        queryFn: () => getRevenue(accessToken!, { from, to }),
      },
      {
        queryKey: ["get topsellers", from, to],
        queryFn: () => getTopsellers(accessToken!, { from, to }),
      },
      {
        queryKey: ["get new users count", from, to],
        queryFn: () => getNewUsers(accessToken!, { from, to }),
      },
    ],
  });


  return (
    <main className="w-full h-full pl-[20vw] pr-[10vw] flex flex-col items-center justify-evenly">
      <ChangeTimeframeDropdown />
      <div className="flex justify-between items-center w-full">
        <StatisticCard
          title="New User:"
          isLoading={usersResults.isLoading}
          isError={usersResults.isError}
          statistic={usersResults.data?.count}
        />
        <StatisticCard
          title="Total Revenue:"
          isLoading={revenueResults.isLoading}
          isError={revenueResults.isError}
          statistic={
            revenueResults.data?.totalRevenue +
            " " +
            revenueResults.data?.currency
          }
        />
        <StatisticCard
          title="Total Orders:"
          isLoading={revenueResults.isLoading}
          isError={revenueResults.isError}
          statistic={revenueResults.data?.totalOrders}
        />
      </div>
      <RevenueChart fetchResult={revenueResults} />
      <TopsellersCarousel fetchResult={topsellersResults} />
    </main>
  );
}

export default Page