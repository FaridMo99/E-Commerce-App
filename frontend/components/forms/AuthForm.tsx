"use client";
import z, { ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import InputValidationFailedText from "../main/InputValidationFailedText";
import { cn } from "@/lib/utils";
import SubmitButton from "./SubmitButton";

export type InputField<TSchema extends ZodType<FieldValues>> = {
  label: string;
  name: keyof z.infer<TSchema>;
  type: string;
  placeholder?: string;
};

export type CaptchaFormProps<
  TFieldValues extends FieldValues,
  TSchema extends ZodType<TFieldValues>,
> = {
  schema: TSchema;

  headerText: string;
  mutationKey: string[];

  mutation: (input: TFieldValues) => Promise<void>;
  successMessage: string;
  successRedirect: `/${string}`;
  description: string;
  fields: InputField<TSchema>[];
  children?: ReactNode;
};

export default function CaptchaForm<
  TFieldValues extends FieldValues,
  TSchema extends ZodType<TFieldValues>,
>({
  schema,
  headerText,
  mutationKey,
  mutation,
  successMessage,
  successRedirect,
  description,
  fields,
  children,
}: CaptchaFormProps<TFieldValues, TSchema>) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isSubmitted },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationKey,

    mutationFn: ({
      input
    }: {
      input: TFieldValues;
    }) => mutation(input),

    onSuccess: () => {
      toast.success(successMessage);
      router.push(successRedirect);
    },

    onError: (err) => {
      toast.error(err?.message ?? "An error occurred");
    },
  });

  async function submitHandler(input: TFieldValues): Promise<void> {
      mutate({ input });
  }

  const buttonDisabled = isSubmitting || (!isValid && isSubmitted) || isPending;

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="bg-backgroundBright text-white">
        <CardHeader>
          <CardTitle>{headerText}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(submitHandler)}>
            <FieldGroup>
              {fields.map((field) => {
                const fieldName = field.name;

                return (
                  <Field key={String(field.name)}>
                    <FieldLabel htmlFor={String(fieldName)}>
                      {field.label}
                    </FieldLabel>

                    <Input
                      id={String(fieldName)}
                      type={field.type}
                      placeholder={field.placeholder}
                      {...register(String(fieldName))}
                    />

                    <InputValidationFailedText
                      trigger={errors[fieldName]}
                      text={errors[fieldName]?.message as string}
                    />
                  </Field>
                );
              })}

              <SubmitButton
                text="Submit"
                disabled={buttonDisabled}
                isPending={isPending}
              />
            </FieldGroup>
            {children}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
