"use client";
import InputValidationFailedText from "@/components/main/InputValidationFailedText";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, UpdateUserSchema } from "@monorepo/shared";
import { Dialog } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";


export function UpdateAccountModal() {
  const accessToken = useAuth((state) => state.accessToken);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(updateUserSchema),
    mode: "onSubmit",
    reValidateMode: "onChange"
  });

  const { errors } = formState;

  const { mutate, isPending } = useMutation({
    mutationKey: ["update user"],
    mutationFn: (user:UpdateUserSchema) => updateUser(user, accessToken!),
    onSuccess: () => {
      toast.success("Updated User successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

    function submitHandler(user: UpdateUserSchema) {
      mutate(user)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Update User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-backgroundBright text-white">
        <form onSubmit={handleSubmit(submitHandler)}>
          <DialogHeader>
            <DialogTitle>Update Account Settings</DialogTitle>
            <DialogDescription>Change your User Settings</DialogDescription>
          </DialogHeader>
          <FieldGroup className="grid gap-4">
            <Field className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" {...register("name")} />
              <InputValidationFailedText
                trigger={errors.name}
                text={errors.name?.message}
              />
            </Field>
            <Field className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              <InputValidationFailedText
                trigger={errors.email}
                text={errors.email?.message}
              />
            </Field>
            <Field className="grid gap-3">
              <Label htmlFor="birthdate">Birthdate</Label>
              <Input id="birthdate" type="birthdate" {...register("birthdate")} />
              <InputValidationFailedText
                trigger={errors.birthdate}
                text={errors.birthdate?.message}
              />
            </Field>
            <Field className="grid gap-3">
              <Label htmlFor="address">Address</Label>
              <Input id="address" type="address" {...register("address")} />
              <InputValidationFailedText
                trigger={errors.address}
                text={errors.address?.message}
              />
            </Field>
                      {/* add currency dropdown */}
                      
          </FieldGroup>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <Loader2 className="animate-spin text-white" />
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
