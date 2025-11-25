"use client"
import { Button } from '@/components/ui/button'
import { addProductToUserCart } from '@/lib/queries/client/usersQueries'
import useAuth from '@/stores/authStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'


type AddCartProps = {
    itemId: string
    quantity:number
}

function AddCart({ itemId, quantity }: AddCartProps) {
    const accessToken = useAuth(state => state.accessToken)
    const queryClient = useQueryClient()
    
    const { mutate, isPending } = useMutation({
        mutationKey: ["add item to cart", itemId, quantity],
        mutationFn: () => {
            if (accessToken) {
            return addProductToUserCart({ productId: itemId, quantity }, accessToken);    
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["get user shopping cart", accessToken]})
            toast.success("Product successfully added to shopping cart")
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })
  return (
      <Button
          className='mt-6'
          onClick={()=>mutate()}
          disabled={isPending || quantity === 0}>{isPending ? <Loader2 className='animate-spin' /> : "Add to Cart"}</Button>
  )
}

export default AddCart