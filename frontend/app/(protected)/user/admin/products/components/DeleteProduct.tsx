"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteProductByProductId } from "@/lib/queries/client/adminQueries";
import useAuth from "@/stores/authStore";
import { AdminProduct } from "@/types/types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { toast } from "sonner";



function DeleteProduct({ product }: { product: AdminProduct }) {
  const accessToken = useAuth(state => state.accessToken)
  const queryClient = useQueryClient()
  
  const {mutate, isPending} = useMutation({
    mutationKey: ["delete product", product.id],
    mutationFn: () => deleteProductByProductId(product.id, accessToken!),
    onError: (err) => {
      toast.error(err.message)
    },
    onSuccess: () => {
      toast.success("Deleted " + product.name + " successfully!")
      queryClient.invalidateQueries({queryKey:["get admin products"]})
    }
  })

      return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive"><Trash/></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you wanna delete {product.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            Product and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={()=>mutate()}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteProduct