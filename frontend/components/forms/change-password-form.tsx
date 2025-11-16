"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
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
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { changePasswordSchema } from "@/schemas/schemas";
import { changePasswordUnauthenticated } from "@/lib/queries/authQueries";
import InputValidationFailedText from "../main/InputValidationFailedText";
import { useRouter } from "next/navigation";
import { ChangePasswordSchema } from "@/types/types";
import useAuth from "@/stores/authStore";

//redirect on success
function ChangePasswordForm({ token }: { token: string }) {
  //submission states
  const [isRequestLoading, setIsRequestLoading] = useState<boolean>(false);

  //form states
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { errors, isSubmitting, isValid, isSubmitted } = formState;
  const buttonDisabledReasons =
    isSubmitting || (!isValid && isSubmitted) || isRequestLoading;
  const router = useRouter();

  async function submitHandler(passwords: ChangePasswordSchema) {
    try {
      setIsRequestLoading(true);
      const res = await changePasswordUnauthenticated(
        token,
        passwords.password,
      );

      toast.success("Password changed successfully!");
      useAuth.setState({
        user: res.user,
        isAuthenticated: true,
        accessToken: res.accessToken,
      });
      router.push("/");
    } catch (err: Error) {
      toast.error(err.message);
    } finally {
      setIsRequestLoading(false);
    }
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
                  type="text"
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
                  type="text"
                  {...register("confirmPassword")}
                  required
                />
                <InputValidationFailedText
                  trigger={errors.confirmPassword}
                  text={errors.confirmPassword?.message}
                />
              </Field>
              <Button disabled={buttonDisabledReasons} type="submit">
                {isRequestLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChangePasswordForm;
