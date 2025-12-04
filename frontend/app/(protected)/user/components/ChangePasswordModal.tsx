"use client"
import InputValidationFailedText from '@/components/main/InputValidationFailedText';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { changePasswordAuthenticatedSchema } from '@/schemas/schemas';
import useAuth from '@/stores/authStore';
import { ChangePasswordAuthenticatedSchema } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { changePasswordAuthenticated } from '@/lib/queries/client/authQueries';

function ChangePasswordModal() {
    const {accessToken, setUser} = useAuth((state) => state);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(changePasswordAuthenticatedSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { errors } = formState;

  const { mutate, isPending } = useMutation({
    mutationKey: ["change password"],
    mutationFn: (passwords: ChangePasswordAuthenticatedSchema) => changePasswordAuthenticated(passwords, accessToken!),
      onSuccess: (data) => {
        setUser(data)
        toast.success("Changed Password successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function submitHandler(passwords: ChangePasswordAuthenticatedSchema) {
    mutate(passwords);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Change Password</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-backgroundBright text-white">
        <form onSubmit={handleSubmit(submitHandler)}>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <FieldGroup className="grid gap-4 mt-2">
            <Field className="grid gap-3">
              <Label htmlFor="password">Old Password</Label>
              <Input
                id="oldPassword"
                type="password"
                {...register("oldPassword")}
              />
              <InputValidationFailedText
                trigger={errors.oldPassword}
                text={errors.oldPassword?.message}
              />
            </Field>
            <Field className="grid gap-3">
              <Label htmlFor="password">New Password</Label>
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

export default ChangePasswordModal