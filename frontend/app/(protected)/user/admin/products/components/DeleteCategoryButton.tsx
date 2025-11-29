"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import {  deleteCategoryByCategoryId } from "@/lib/queries/client/adminQueries";
import useAuth from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CategorySelect from "./CategorySelect";


export function DeleteCategoryButton() {
  const accessToken = useAuth((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState<string>("");
  const closeRef = useRef<HTMLButtonElement>(null);

  const { mutate, isPending } = useMutation({
    mutationKey: ["delete categorie",categoryId],
    mutationFn: () => deleteCategoryByCategoryId(categoryId, accessToken!),
    onSuccess: () => {
      toast.success("Deleted Category successfully!");
      queryClient.invalidateQueries({ queryKey: ["get all categories"] });
      closeRef.current?.click();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="text-white cursor-pointer hover:text-white/80 border"
        >
          Delete Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-backgroundBright text-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <FieldGroup className="grid gap-4 mt-4">
            <Field className="grid gap-3">
              <CategorySelect setCategoryId={setCategoryId} categoryId={categoryId} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <DialogClose asChild ref={closeRef}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={isPending || categoryId.length === 0}
              type="submit"
            >
              {isPending ? (
                <Loader2 className="animate-spin text-white" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
