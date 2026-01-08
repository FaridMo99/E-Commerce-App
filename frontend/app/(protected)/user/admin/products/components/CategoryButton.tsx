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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ReactNode, useRef } from "react";
import { toast } from "sonner";

type CategoryButtonProps<T, U> = {
    mutationKey: string[];
    mutationFn: (args: U) => Promise<T>;
    mutationArgs: U;
    invalidQueries: string[];
    successMessage: string;
    buttonText: string;
    title: string;
    children: ReactNode;
    submitButtonText: string;
    categoryLength: number;
};  

export function CategoryButton<T,U>({mutationKey,mutationFn, mutationArgs, invalidQueries, successMessage, buttonText, title, submitButtonText, categoryLength, children}:CategoryButtonProps<T,U>) {
  const queryClient = useQueryClient();
  const closeRef = useRef<HTMLButtonElement>(null);

  const { mutate, isPending } = useMutation({
    mutationKey,
    mutationFn: () => mutationFn(mutationArgs),
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: invalidQueries });
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
            {buttonText}
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
            <DialogTitle>{title}</DialogTitle>
                  </DialogHeader>
                  
                  {children}
                  
          <DialogFooter className="mt-4">
            <DialogClose asChild ref={closeRef}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              disabled={isPending || categoryLength === 0}
              type="submit"
            >
              {isPending ? (
                <Loader2 className="animate-spin text-white" />
              ) : (
                submitButtonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
