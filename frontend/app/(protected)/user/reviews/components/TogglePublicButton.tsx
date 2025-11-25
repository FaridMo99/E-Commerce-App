"use client";
import { Button } from "@/components/ui/button";
import { setReviewPrivateOrPublic } from "@/lib/queries/client/reviewsQueries";
import useAuth from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type TogglePublicButtonProps = {
    reviewId: string
    oldState:boolean
}

function TogglePublicButton({reviewId, oldState}:TogglePublicButtonProps) {
    const accessToken = useAuth((state) => state.accessToken);
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
      mutationKey: ["toggle review state", reviewId, oldState],
      mutationFn: () => setReviewPrivateOrPublic(reviewId,!oldState,accessToken!),
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: () => {
        toast.success(`Review successfully set ${oldState === true ? "Private" : "Public"}`);
        queryClient.invalidateQueries({
          queryKey: ["get user product reviews"],
        });
      },
    });

    return (
      <Button
        disabled={isPending}
        className="bg-blue-500"
        onClick={() => mutate()}
      >
        {!isPending && oldState && "Set Private"}
        {!isPending && !oldState && "Set Public"}
        {isPending && <Loader2 className="animate-spin" />}
      </Button>
    );
}

export default TogglePublicButton;
