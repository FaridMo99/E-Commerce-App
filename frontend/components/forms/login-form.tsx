"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { LoginSchema, loginSchema } from "@monorepo/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import useAuth from "@/stores/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { Loader2 } from "lucide-react";
import InputValidationFailedText from "../main/InputValidationFailedText";
import Facebook from "../icons/Facebook";
import Google from "../icons/Google";
import OAuthButton from "./OAuthButton";
import { login } from "@/lib/queries/client/authQueries";
import { useMutation } from "@tanstack/react-query";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  //submission states
  const { mutate, isPending } = useMutation({
    mutationKey: ["login user"],
    mutationFn: ({ credentials, captchaToken }: { credentials: LoginSchema, captchaToken: string }) => login(credentials, captchaToken),
    onSuccess: (result) => {
      setState(result.accessToken, result.user);

      router.push("/");
      toast.success("Login successful");
    },
    onError: (err) => {
      toast.error(err.message)
    },
    onSettled: () => {
        turnstileRef.current?.reset();
    }
  })

  //auth store
  const setState = useAuth((state) => state.setState);

  //form states
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { errors, isSubmitting, isValid, isSubmitted } = formState;
  const buttonDisabledReasons =
    isSubmitting || (!isValid && isSubmitted) || isPending;
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance | null>(null);



  async function submitHandler(credentials: LoginSchema) {
    try {

      turnstileRef.current?.execute();
      const captchaToken = await turnstileRef.current?.getResponsePromise();
      if (!captchaToken) throw new Error("Failed Captcha");

      mutate({credentials, captchaToken});

    } catch (err) {
      toast.error(err.message);
    } 
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-backgroundBright text-white">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email below to Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitHandler)}>
            <FieldGroup>
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
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
                  {isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card my-2">
                  Or continue with
                </FieldSeparator>
                <OAuthButton
                  bgColor="#DB4437"
                  disabled={isSubmitting || isPending}
                  logoSvg={<Google />}
                  text="Sign in with Google"
                  provider="google"
                />
                <OAuthButton
                  bgColor="#1877F2"
                  disabled={isSubmitting || isPending}
                  logoSvg={<Facebook />}
                  text="Sign in with Facebook"
                  provider="facebook"
                />
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup">Sign up</Link>
                </FieldDescription>
                <FieldDescription className="text-center">
                  <Link href="/forgot-password"> Forgot Password?</Link>
                </FieldDescription>
                <FieldDescription className="text-center">
                  <Link href="/new-verification-link"> Send New Verification Link</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
