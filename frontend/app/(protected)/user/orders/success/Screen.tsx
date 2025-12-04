"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getUserOrderByStripeSessionId } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function Screen({ sessionId }: { sessionId: string }) {
  const accessToken = useAuth((state) => state.accessToken);
  const router = useRouter();
  const { data:order, isLoading, isError } = useQuery({
    queryKey: ["get recent order"],
    queryFn: () => getUserOrderByStripeSessionId(sessionId, accessToken!),
    enabled:!!accessToken && !!sessionId,
  });

  return (

    <Card className="h-full flex flex-col justify-center items-center text-center p-8 bg-backgroundBright text-white text-lg font-bold gap-4">
      <CardTitle className="flex items-center gap-2 justify-center">Order:</CardTitle>
      <CardContent>
        {isLoading && <Loader2 className="animate-spin" />}
        {isError && <p>Something went wrong...</p>}
        {!isLoading && order && (
          <div className="w-full h-2/3 flex flex-col justify-evenly items-start pl-8">
            <p className="self-center text-white text-lg font-semibold">
              Total Items: { }
            </p>
            {order?.items.map((item) => (
              <p className="text-white/70" key={item.product.id}>
                Item: {item.quantity}x {item.product.name} {item.price_at_purchase}{" "}
                {item.currency}
              </p>
            ))}
            <p className="self-center text-white text-lg font-semibold">
              Total Price:{order.total_amount}
              {order.currency}
            </p>
          </div>
        )}
      </CardContent>
      <div className="w-full justify-center items-center">
        <Button onClick={() => router.push("/")}>Go Home</Button>
        <Button className="ml-4" onClick={() => router.push("/user/orders")}>
          Go To Orders
        </Button>
      </div>
    </Card>
  );
}

export default Screen;
