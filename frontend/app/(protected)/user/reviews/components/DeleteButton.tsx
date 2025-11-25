"use client"
import { Button } from "@/components/ui/button"
import { deleteReviewByReviewId } from "@/lib/queries/client/reviewsQueries"
import useAuth from "@/stores/authStore"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"


function DeleteButton({ reviewId }: { reviewId: string }) {
    const accessToken = useAuth(state => state.accessToken)
    const queryClient = useQueryClient()
    const { mutate, isPending} = useMutation({
        mutationKey: ["delete review", reviewId],
        mutationFn: () => deleteReviewByReviewId(reviewId, accessToken!),
        onError: (err) => {
            toast.error(err.message)
        },
        onSuccess: () => {
            toast.success("Review deleted successfully")
            queryClient.invalidateQueries({
              queryKey: ["get user product reviews"],
            });
        }
    })


  return (
      <Button disabled={isPending} className="bg-red-500" onClick={() => mutate()}>{isPending ? <Loader2 className="animate-spin"/> : "Delete"}</Button>
  )
}

export default DeleteButton