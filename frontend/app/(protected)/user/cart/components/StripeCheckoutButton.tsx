"use client";
import { Button } from "@/components/ui/button";
import { makeOrder } from "@/lib/queries/client/ordersQueries";
import useAuth from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function StripeCheckoutButton({ disabled }: { disabled: boolean }) {
  const accessToken = useAuth(state => state.accessToken)
  const queryClient = useQueryClient()
  const router = useRouter()
  
  const { mutate, isPending } = useMutation({
    mutationKey: ["checkout"],
    mutationFn: () => makeOrder(accessToken!),
    onError: (err) => {
      toast.error(err.message)
      queryClient.invalidateQueries({ queryKey: ["get user shopping cart"] });
    },
    onSuccess: (data) => {
      router.push(data.redirectUrl);
    }
  })


  return <Button onClick={()=>mutate()} disabled={disabled || isPending}>{isPending ? <Loader2 className="animate-spin text-white"/> : "Checkout"}</Button>;
}

export default StripeCheckoutButton;