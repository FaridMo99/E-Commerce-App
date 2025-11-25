"use client";

import LoadingPage from "@/components/main/LoadingPage";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { getUserOrders } from "@/lib/queries/client/usersQueries";
import OrdersFilter from "./components/OrdersFilter";
import { useSearchParams } from "next/navigation";
import { ordersQuerySchema } from "@monorepo/shared";
import OrderCard from "./components/OrderCard";

//error page
function Page() {
  const accessToken = useAuth((state) => state.accessToken);
  const searchParams = useSearchParams();

const rawParams = {
  status: searchParams.get("status") ?? undefined,
  sort: searchParams.get("sort") ?? undefined,
  order: searchParams.get("order") ?? undefined,
};

const parsed = ordersQuerySchema.safeParse(rawParams);

const filters = parsed.data
const {
  data: orders,
  isLoading,
  isError,
  error,
} = useQuery({
  queryKey: ["get user orders", filters],
  queryFn: () => getUserOrders(accessToken!, filters ),
});

  if (isLoading) return <LoadingPage />;
  if (isError) throw error;

  return (
    <main className="px-8">
      <section className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold mb-2">
          Orders ({orders?.length})
        </h2>
        <OrdersFilter />
      </section>
      <section className="w-full flex flex-col items-center justify-evenly">
        {orders?.map(order=><OrderCard key={order.id} order={order}/>)}
    </section>
    </main>
  );
}

export default Page;
