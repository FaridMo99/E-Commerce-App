"use client";
import InputValidationFailedText from "@/components/main/InputValidationFailedText";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePasswordSchema } from "@/schemas/schemas";
import useAuth from "@/stores/authStore";
import { ChangePasswordSchema } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {  setPassword } from "@/lib/queries/client/authQueries";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SubmitButton from "@/components/forms/SubmitButton";


function SetPasswordForm() {
  const { accessToken, setUser } = useAuth((state) => state);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { errors, isDirty } = formState;

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
    <Card className="sm:max-w-[425px] mx-auto p-6 bg-backgroundBright text-white">
      <form onSubmit={handleSubmit(submitHandler)}>
        <CardHeader className="p-0">
          <CardTitle>Set a Password</CardTitle>
          <CardDescription>
            Since you didnt set a Password yet, you can set one here to login
            without Google/Facebook
          </CardDescription>
        </CardHeader>
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

export default SetPasswordForm;
