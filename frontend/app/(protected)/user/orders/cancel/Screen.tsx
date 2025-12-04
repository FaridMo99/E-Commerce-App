"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cancelOrder } from "@/lib/queries/client/ordersQueries";
import useAuth from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect } from "react";

function Screen({ cancelOrderId }: { cancelOrderId: string }) {
  const accessToken = useAuth((state) => state.accessToken);

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationKey: ["cancel order", cancelOrderId],
    mutationFn: () => cancelOrder(cancelOrderId, accessToken!),
  });

  useEffect(() => {
    mutate();
  }, [mutate]);


  return (
    <div className="w-full h-full flex justify-center items-center">
      <Card className="h-full w-1/2 flex flex-col justify-center items-center text-center p-12 bg-backgroundBright text-white text-lg font-bold gap-4">
        <CardTitle className="flex items-center gap-2 justify-center">
          {isPending && <Loader2 className="animate-spin" />}
          {isSuccess && <p>Order got successfuly cancelled.</p>}
          {isError && <p>{error?.message || "Something went wrong"}</p>}
        </CardTitle>
        <CardContent>
          {isSuccess && <CheckCircle2 size={50} className="text-green-400" />}
          {isError && <XCircle size={50} className="text-red-500" />}
        </CardContent>
        {isError && (
          <Button disabled={isPending} onClick={() => mutate()}>
            {isPending ? <Loader2 className="animate-spin" /> : "Retry"}
          </Button>
        )}
      </Card>
    </div>
  );
}

export default Screen;
