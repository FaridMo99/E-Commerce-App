"use client"
import InputValidationFailedText from '@/components/main/InputValidationFailedText';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { changePasswordAuthenticatedSchema } from '@/schemas/schemas';
import useAuth from '@/stores/authStore';
import { ChangePasswordAuthenticatedSchema } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { changePasswordAuthenticated } from '@/lib/queries/client/authQueries';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SubmitButton from '@/components/forms/SubmitButton';

function ChangePasswordForm() {
    const {accessToken, setUser} = useAuth((state) => state);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(changePasswordAuthenticatedSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { errors,isDirty } = formState;

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
    <Card className="sm:max-w-[425px] mx-auto p-6 bg-backgroundBright text-white">
      <form onSubmit={handleSubmit(submitHandler)}>
        <CardHeader className='p-0'>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
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
        <CardFooter className="mt-4 justify-center p-0">
          <SubmitButton
            text="Submit"
            disabled={isPending || !isDirty}
            isPending={isPending}
          />
        </CardFooter>
      </form>
    </Card>
  );
}

export default ChangePasswordForm