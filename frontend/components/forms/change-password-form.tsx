"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { changePasswordSchema } from "@/schemas/schemas";
import InputValidationFailedText from "../main/InputValidationFailedText";
import { useRouter } from "next/navigation";
import { ChangePasswordSchema } from "@/types/types";
import useAuth from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { changePasswordUnauthenticated } from "@/lib/queries/client/authQueries";
import SubmitButton from "./SubmitButton";


function ChangePasswordForm({ token }: { token: string }) {
console.log(token)
  const setState = useAuth(state=>state.setState)
  const { mutate, isPending } = useMutation({
    mutationKey: ["change password for unauthenticated user"],
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      changePasswordUnauthenticated(token, password),
    onSuccess: (res) => {
      toast.success("Password changed successfully!");
      setState(res.accessToken, res.user);
      router.push("/");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  //form states
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { errors, isSubmitting, isValid, isSubmitted } = formState;
  const buttonDisabledReasons =
    isSubmitting || (!isValid && isSubmitted) || isPending;
  const router = useRouter();

  function submitHandler(passwords: ChangePasswordSchema) {
    mutate({token,password:passwords.password})
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="bg-backgroundBright text-white ">
        <CardHeader>
          <CardTitle>Change Password:</CardTitle>
          <CardDescription>Enter your new Password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitHandler)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">Password:</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  required
                />
                <InputValidationFailedText
                  trigger={errors.password}
                  text={errors.password?.message}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password:
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  required
                />
                <InputValidationFailedText
                  trigger={errors.confirmPassword}
                  text={errors.confirmPassword?.message}
                />
              </Field>
              <SubmitButton
                text="Submit"
                disabled={buttonDisabledReasons}
                isPending={isPending}
              />
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChangePasswordForm;
