"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signup } from "@/lib/queries/authQueries";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { Loader2 } from "lucide-react";
import OptionalFieldMarker from "../main/OptionalFieldMarker"
import InputValidationFailedText from "../main/InputValidationFailedText"
import { clientSignupSchema } from "@/schemas/schemas"
import {z} from "zod"

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
    const buttonDisabledReasons = isSubmitting || (!isValid && isSubmitted) || isSignupLoading;
    const turnstileRef = useRef<TurnstileInstance | null>(null);
  
    async function submitHandler(credentials:z.infer<typeof clientSignupSchema>) {
      try {
        setIsSignupLoading(true)
        const { confirmPassword, ...rest } = credentials

        await turnstileRef.current?.execute()
        const captchaToken = turnstileRef.current?.getResponse();
        if (!captchaToken) throw new Error("Failed Captcha")
        
        await signup(rest, captchaToken)
  
        toast.success("Signup successful. Check your E-Mails and follow the link")
        reset()

      } catch (err:Error) {
        toast.error(err.message)
      } finally {
        setIsSignupLoading(false)
      }
  
    }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 bg-backgroundBright text-white">
        <CardContent>
          <form onSubmit={handleSubmit(submitHandler)} className="p-6 md:p-8">
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
                <FieldLabel htmlFor="address">
                  Address
                  <OptionalFieldMarker />
                </FieldLabel>
                <Input {...register("address")} id="address" type="text" />
                <InputValidationFailedText
                  trigger={errors.address}
                  text={errors.address?.message}
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
                      id="confirmPassword" type="password" required />
                    <InputValidationFailedText trigger={errors.confirmPassword} text={errors.confirmPassword?.message} />
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
                    "Sign in"
                  )}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="flex justify-center items-center">
                <Button
                  disabled={isSubmitting || isSignupLoading}
                  style={{ backgroundColor: "#DB4437", color: "white" }}
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </Button>
                <Button
                  disabled={isSubmitting || isSignupLoading}
                  style={{ backgroundColor: "#1877F2", color: "white" }}
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Sign up with Meta</span>
                </Button>
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