"use client"
import { Button } from '@/components/ui/button'
import { removeItemFromCart } from '@/lib/queries/client/usersQueries'
import useAuth from '@/stores/authStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'


function RemoveItemButton({ itemId }: { itemId: string }) {
  const accessToken = useAuth(state => state.accessToken)
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationKey: ["remove cart item", itemId],
    mutationFn: () => removeItemFromCart(itemId, accessToken!),
    onError: (err) => {
      toast.error(err.message)
    },
    onSuccess: () => {
      toast.success("Successfully removed Item from cart")
      queryClient.invalidateQueries({ queryKey: ["get user shopping cart"] });
    }
  })

  return (
    <Button onClick={()=>mutate()} disabled={isPending} className='bg-red-500 py-4 h-3'>{isPending ? <Loader2/> : "Remove Item"}</Button>
  )
}

export default RemoveItemButton