"use client"
import { addFavoriteItemByProductId, deleteFavoriteItemByProductId } from "@/lib/queries/client/usersQueries"
import useAuth from "@/stores/authStore"
import { Bookmark } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type FavoriteProductProps = {
    productId: string
    isFavorite: boolean
    setIsFavorite:React.Dispatch<boolean>
}

function FavoriteProduct({ productId, isFavorite, setIsFavorite }: FavoriteProductProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const accessToken = useAuth((state) => state.accessToken);

    if (!accessToken) return null;

    async function buttonHandler() {
        if (!accessToken) return null;

        try {
            setIsLoading(true) 

            if (!isFavorite) {
             await addFavoriteItemByProductId(productId,accessToken); 
            }
            setIsFavorite(false)
            if (isFavorite) {
                await deleteFavoriteItemByProductId(productId, accessToken);
                setIsFavorite(true)
            }

        } catch (err:Error) {
            toast.error(err.message)
        }
        finally {
            setIsLoading(false)
        }
    }
  return (
      <button
          type="button"
          disabled={isLoading}
          onClick={(e) => {
              e.preventDefault()
              buttonHandler()
          }}
          aria-label="Add product to favorites"
          className="z-50"
      >
          <Bookmark className={`${isFavorite ?  "fill-current" : ""} text-backgroundBright hover:scale-125 hover:cursor-pointer`} />
    </button>
  )
}

export default FavoriteProduct