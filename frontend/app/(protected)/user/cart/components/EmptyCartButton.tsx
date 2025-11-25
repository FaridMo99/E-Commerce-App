"use client"
import { deleteUserCart } from '@/lib/queries/client/usersQueries'
import useAuth from '@/stores/authStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

function EmptyCartButton() {
    const accessToken = useAuth(state => state.accessToken)
    const queryClient = useQueryClient()
    
    const { mutate, isPending } = useMutation({
        mutationKey: ["empty cart"],
        mutationFn: () => deleteUserCart(accessToken!),
        onError: (err) => {
            toast.error(err.message)
        },
        onSuccess: () => {
            toast.success("Deleted Shopping cart successfully!")
            queryClient.invalidateQueries({
              queryKey: ["get user shopping cart"],
            });
        }
    })
  return (
      <button onClick={()=>mutate()} disabled={isPending} aria-label='empty cart' title='Delete Cart' className='absolute top-2 left-2 z-2 text-black border-2 border-black cursor-pointer'>
          {isPending ? <Loader2 className='animate-spin text-black'/> : <X />}
      </button>
  )
}

export default EmptyCartButton