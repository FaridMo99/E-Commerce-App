"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "@/lib/queries/authQueries";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { Loader2 } from "lucide-react";
import OptionalFieldMarker from "../main/OptionalFieldMarker";
import InputValidationFailedText from "../main/InputValidationFailedText";
import { clientSignupSchema } from "@/schemas/schemas";
import { z } from "zod";
import OAuthButton from "./OAuthButton";
import Facebook from "../icons/Facebook";

//add rerequesting the email logic
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  //submission states
  const [isSignupLoading, setIsSignupLoading] = useState<boolean>(false);

  //form states
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(clientSignupSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { errors, isSubmitting, isValid, isSubmitted } = formState;
  const buttonDisabledReasons =
    isSubmitting || (!isValid && isSubmitted) || isSignupLoading;
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  async function submitHandler(
    credentials: z.infer<typeof clientSignupSchema>,
  ) {
    try {
      setIsSignupLoading(true);
      const { confirmPassword, ...rest } = credentials;

      turnstileRef.current?.execute();
      const captchaToken = await turnstileRef.current?.getResponsePromise();
      if (!captchaToken) throw new Error("Failed Captcha");

      await signup(rest, captchaToken);

      toast.success(
        "Signup successful. Check your E-Mails and follow the link",
      );
      reset();
    } catch (err: Error) {
      toast.error(err.message);
    } finally {
      turnstileRef.current?.reset();
      setIsSignupLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className=" bg-backgroundBright text-white">
        <CardContent>
          <form onSubmit={handleSubmit(submitHandler)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to create your account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input {...register("name")} id="name" type="text" required />
                <InputValidationFailedText
                  trigger={errors.name}
                  text={errors.name?.message}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <InputValidationFailedText
                  trigger={errors.email}
                  text={errors.email?.message}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="birthdate">
                  Birthdate
                  <OptionalFieldMarker />
                </FieldLabel>
                <Input {...register("birthdate")} id="birthdate" type="date" />
                <InputValidationFailedText
                  trigger={errors.birthdate}
                  text={errors.birthdate?.message}
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...register("password")}
                      id="password"
                      type="password"
                      required
                    />
                    <InputValidationFailedText
                      trigger={errors.password}
                      text={errors.password?.message}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      {...register("confirmPassword")}
                      id="confirmPassword"
                      type="password"
                      required
                    />
                    <InputValidationFailedText
                      trigger={errors.confirmPassword}
                      text={errors.confirmPassword?.message}
                    />
                  </Field>
                </Field>
              </Field>
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY!}
                options={{
                  size: "invisible",
                  execution: "execute",
                }}
              />
              <Field>
                <Button disabled={buttonDisabledReasons} type="submit">
                  {isSignupLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="flex justify-center items-center">
                <OAuthButton
                  bgColor="#DB4437"
                  disabled={isSubmitting || isSignupLoading}
                  logoSvg={<Facebook />}
                  text="Sign up with Google"
                  provider="google"
                />
                <OAuthButton
                  bgColor="#1877F2"
                  disabled={isSubmitting || isSignupLoading}
                  logoSvg={<Facebook />}
                  text="Sign up with Facebook"
                  provider="facebook"
                />
              </Field>
              <FieldDescription className="text-center">
                Fields marked with <OptionalFieldMarker /> are optional
              </FieldDescription>
              <FieldDescription className="text-center">
                Already have an account? <Link href="/login">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {/*<FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>*/}
    </div>
  );
}
