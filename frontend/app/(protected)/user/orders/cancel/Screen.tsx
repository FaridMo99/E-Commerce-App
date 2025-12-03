import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cancelOrder } from "@/lib/queries/client/ordersQueries";
import useAuth from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function Screen({ cancelOrderId }: { cancelOrderId: string }) {
  const accessToken = useAuth((state) => state.accessToken);
  const [counter, setCounter] = useState<number | null>(null);
  const router = useRouter();

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationKey: ["cancel order", cancelOrderId],
    mutationFn: () => cancelOrder(cancelOrderId, accessToken!),
    onSuccess: () => {
      setCounter(3);
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);


  useEffect(() => {
    if (counter === null) return;
    if (counter === 0) {
      router.push("/user/cart");
      return;
    }

    const timer = setTimeout(() => {
      setCounter((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [counter, router]);

  return (
    <Card className="h-full flex flex-col justify-center items-center text-center p-8 bg-backgroundBright text-white text-lg font-bold gap-4">
      <CardTitle className="flex items-center gap-2 justify-center">
        {isPending && <Loader2 className="animate-spin" />}
        {isSuccess && <p>Order got cancelled. Redirecting in {counter}</p>}
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
  );
}

export default Screen;
