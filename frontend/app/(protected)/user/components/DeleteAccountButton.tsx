"use client"
import { AlertDialogFooter, AlertDialogHeader } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteUser } from "@/lib/queries/client/usersQueries"
import useAuth from "@/stores/authStore"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useMutation } from "@tanstack/react-query"
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you wanna delete your Account?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    Account and remove your data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={()=>mutate()}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteAccountButton