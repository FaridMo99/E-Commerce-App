"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import InputValidationFailedText from "@/components/main/InputValidationFailedText";
import { useRouter } from "next/navigation";
import { EmailSchema, emailSchema } from "@monorepo/shared";
import { useMutation } from "@tanstack/react-query";
import { clientSendNewVerificationLink } from "@/lib/queries/clientSideQueries";

//redirect on success
function NewVerifyLinkForm({ headerText }: { headerText: string }) {
  //submission states
      const { mutate, isPending } = useMutation({
        mutationKey: ["change password for unauthenticated user"],
        mutationFn: ({
          email,
          captchaToken,
        }: {
          email: EmailSchema;
          captchaToken: string;
        }) => clientSendNewVerificationLink(email, captchaToken),
        onSuccess: () => {
          toast.success(
            "Submit successful! Check your E-Mails and follow the link."
          );
          router.push("/");
        },
        onError: (err) => {
          toast.error(err.message);
        },
        onSettled: () => {
          turnstileRef.current?.reset();
        },
      });

  //form states
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(emailSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { errors, isSubmitting, isValid, isSubmitted } = formState;
  const buttonDisabledReasons =
    isSubmitting || (!isValid && isSubmitted) || isPending;
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const router = useRouter();

    async function submitHandler(credentials: EmailSchema) {
      try {
        // Execute Turnstile captcha
        turnstileRef.current?.execute();
        const captchaToken = await turnstileRef.current?.getResponsePromise();

        if (!captchaToken) throw new Error("Failed Captcha");

        // Pass a single object to mutate
        mutate({ email: credentials, captchaToken });
      } catch (err) {
        toast.error(err.message || "Something went wrong");
      }
    }

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="bg-backgroundBright text-white ">
        <CardHeader>
          <CardTitle>{headerText}</CardTitle>
          <CardDescription>
            Enter your email to receive a new Link
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
                {isPending ? (
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

export default NewVerifyLinkForm;
