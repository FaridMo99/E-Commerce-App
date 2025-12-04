"use client";
import { getUserCart } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import EmptyCartButton from "./EmptyCartButton";
import { Skeleton } from "@/components/ui/skeleton";
import ItemSection from "./ItemSection";
import SummarySection from "./SummarySection";

function Screen() {
  const accessToken = useAuth((state) => state.accessToken);

  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["get user shopping cart"],
    queryFn: () => getUserCart(accessToken!),
    enabled: !!accessToken,
  });

  if (isError) throw error;

  return (
    <main className="w-full h-full flex justify-center items-center">
      {isLoading && <Skeleton className="w-[80vw] h-[67vh] rounded-2xl" />}
      {!isLoading && cart && (
        <div className="w-[80vw] h-[67vh] bg-backgroundBright flex border rounded-2xl overflow-clip relative">
          {cart && cart.items.length > 0 && <EmptyCartButton />}
          <ItemSection items={cart.items} />
          <SummarySection cart={cart} />
        </div>
      )}
    </main>
  );
}

export default Screen;
