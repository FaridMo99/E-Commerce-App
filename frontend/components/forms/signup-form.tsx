"use client";
import { cn } from "@/lib/utils";
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
import { signup } from "@/lib/queries/client/authQueries";
import { useRef } from "react";
import { toast } from "sonner";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import OptionalFieldMarker from "../main/OptionalFieldMarker";
import InputValidationFailedText from "../main/InputValidationFailedText";
import { clientSignupSchema } from "@/schemas/schemas";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SignupSchema } from "@monorepo/shared";
import OAuthButtonSection from "./OAuthButtonSection";
import SubmitButton from "./SubmitButton";


export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { mutate, isPending } = useMutation({
    mutationKey: ["signing up user"],
    mutationFn: ({
      mutateCredentials,
      captchaToken,
    }: {
      mutateCredentials:SignupSchema;
      captchaToken: string;
    }) => signup(mutateCredentials, captchaToken),
    onSettled: () => {
      turnstileRef.current?.reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
    onSuccess: () => {
      toast.success(
        "Signup successful. Check your E-Mails and follow the link"
      );
      router.push("/");
    },
  });

  //form states
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(clientSignupSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { errors, isSubmitting, isValid, isSubmitted } = formState;
  const buttonDisabledReasons =
    isSubmitting || (!isValid && isSubmitted) || isPending;
  const turnstileRef = useRef<TurnstileInstance | null>(null);


  
    async function submitHandler(credentials:z.infer<typeof clientSignupSchema>) {
      try {
        // Execute Turnstile captcha
        turnstileRef.current?.execute();
        const captchaToken = await turnstileRef.current?.getResponsePromise();

        if (!captchaToken) throw new Error("Failed Captcha");

        const {confirmPassword, ...rest} = credentials
        // Pass a single object to mutate
        mutate({ mutateCredentials: rest, captchaToken });
      } catch (err) {
        toast.error(err.message || "Something went wrong");
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
                <SubmitButton text="Sign up" disabled={buttonDisabledReasons} isPending={isPending} />
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <OAuthButtonSection
                isPending={isPending}
                isSubmitting={isSubmitting}
              />
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
