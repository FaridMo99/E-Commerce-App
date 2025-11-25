"use client"
import { addFavoriteItemByProductId, deleteFavoriteItemByProductId, getUserFavoriteItems } from "@/lib/queries/client/usersQueries"
import useAuth from "@/stores/authStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bookmark } from "lucide-react"
import { toast } from "sonner"


type FavoriteProductProps = {
    productId: string
}

function FavoriteProduct({ productId }: FavoriteProductProps) {
    const accessToken = useAuth((state) => state.accessToken);
    const queryClient = useQueryClient()

    const { data: favoriteItems, isLoading, isError } = useQuery({
        queryKey: ["get favorite products"],
        queryFn: () => {
            if(accessToken) return getUserFavoriteItems(accessToken)
        },
        enabled:!!accessToken
    })
    
    const isFavorite = favoriteItems?.some((item) => item.id === productId);
    
    const { mutate, isPending } = useMutation({
      mutationKey: ["favorising product", productId],
      mutationFn: async () => {
            if (isFavorite) {
                await deleteFavoriteItemByProductId(productId, accessToken!);
            } else {
                await addFavoriteItemByProductId(productId, accessToken!);
            }
        },
      onSuccess: () => {
        toast.success("Successful");
        queryClient.invalidateQueries({ queryKey: ["get favorite products"] });
      },
      onError: () => {
        toast.error("Something went wrong");
        },
    });

    if (!accessToken || isLoading || isError) return null;

  return (
      <button
          type="button"
          disabled={isPending || isLoading}
          onClick={(e) => {
              e.preventDefault()
              mutate()
          }}
          aria-label="Add product to favorites"
          className="z-50 self-end"
      >
          <Bookmark className={`${isFavorite ?  "fill-current" : ""} text-foreground hover:scale-125 hover:cursor-pointer`} />
    </button>
  )
}

export default FavoriteProduct