"use client"

import { Button } from "@/components/ui/button"
import { deleteUser } from "@/lib/queries/client/usersQueries"
import useAuth from "@/stores/authStore"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"


function DeleteAccountButton() {
    const accessToken = useAuth(state => state.accessToken)
    const router = useRouter()

    const { mutate, isPending } = useMutation({
        mutationKey: ["delete user"],
        mutationFn: () => deleteUser(accessToken!),
        onError: (err) => {
            toast.error(err.message)
        },
        onSuccess: () => {
            toast.success("Deleted Account successfully")
            router.refresh()
        }
    })



  return (
      <Button onClick={()=>mutate()} disabled={isPending}>{isPending ? <Loader2 className="animate-spin"/> : "Delete Account"}</Button>
  )
}

export default DeleteAccountButton