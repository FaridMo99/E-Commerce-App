"use client";
import InputValidationFailedText from "@/components/main/InputValidationFailedText";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePasswordSchema } from "@/schemas/schemas";
import useAuth from "@/stores/authStore";
import { ChangePasswordSchema } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {  setPassword } from "@/lib/queries/client/authQueries";


function SetPasswordModal() {
  const { accessToken, setUser } = useAuth((state) => state);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { errors } = formState;

  const { mutate, isPending } = useMutation({
    mutationKey: ["set password"],
    mutationFn: (passwords: ChangePasswordSchema) =>
      setPassword(passwords, accessToken!),
    onSuccess: (data) => {
      setUser(data);
      toast.success("Set Password successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function submitHandler(passwords: ChangePasswordSchema) {
    mutate(passwords);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Set Password</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-backgroundBright text-white">
        <form onSubmit={handleSubmit(submitHandler)}>
          <DialogHeader>
            <DialogTitle>Set a Password</DialogTitle>
            <DialogDescription>
              Since you didnt set a Password yet, you can set one here to login
              without Google/Facebook
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="grid gap-4 mt-2">
            <Field className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              <InputValidationFailedText
                trigger={errors.password}
                text={errors.password?.message}
              />
            </Field>
            <Field className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
              />
              <InputValidationFailedText
                trigger={errors.confirmPassword}
                text={errors.confirmPassword?.message}
              />
            </Field>
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

export default SetPasswordModal;
