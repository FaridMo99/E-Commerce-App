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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { emailSchema } from "@/schemas/schemas";
import { EmailSchema } from "@/types/types";
import { forgotPasswordSendEmail } from "@/lib/queries/authQueries";
import InputValidationFailedText from "../main/InputValidationFailedText";
import { useRouter } from "next/navigation";
import Link from "next/link";

//redirect on success
function ForgotPasswordForm({ headerText }: { headerText: string }) {
  //submission states
  const [isRequestLoading, setIsRequestLoading] = useState<boolean>(false);

  //form states
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(emailSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { errors, isSubmitting, isValid, isSubmitted } = formState;
  const buttonDisabledReasons =
    isSubmitting || (!isValid && isSubmitted) || isRequestLoading;
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const router = useRouter();

  async function submitHandler(credentials: EmailSchema) {
    try {
      setIsRequestLoading(true);

      turnstileRef.current?.execute();
      const captchaToken = await turnstileRef.current?.getResponsePromise();
      if (!captchaToken) throw new Error("Failed Captcha");

      await forgotPasswordSendEmail(credentials, captchaToken);

      toast.success(
        "Submit successful! Check your E-Mails and follow the link.",
      );
      router.push("/");
    } catch (err: Error) {
      toast.error(err.message);
    } finally {
      setIsRequestLoading(false);
      turnstileRef.current?.reset();
    }
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="bg-backgroundBright text-white ">
        <CardHeader>
          <CardTitle>{headerText}</CardTitle>
          <CardDescription>
            Enter your email to receive a email to change your Password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitHandler)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email:</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  required
                />
                <InputValidationFailedText
                  trigger={errors.email}
                  text={errors.email?.message}
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
              <Button disabled={buttonDisabledReasons} type="submit">
                {isRequestLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit"
                )}
              </Button>
            </FieldGroup>
            <Field className="mt-4">
              <FieldDescription className="text-center">
                <Link href="/login"> Back to Login</Link>
              </FieldDescription>
            </Field>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordForm;
