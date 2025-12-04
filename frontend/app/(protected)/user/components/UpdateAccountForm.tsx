"use client";
import SubmitButton from "@/components/forms/SubmitButton";
import InputValidationFailedText from "@/components/main/InputValidationFailedText";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { AuthUser } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, UpdateUserSchema } from "@monorepo/shared";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DeleteAccountButton from "./DeleteAccountButton";


export function UpdateAccountForm({user}:{user:AuthUser}) {
  const accessToken = useAuth((state) => state.accessToken);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(updateUserSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: user.name,
      birthdate: user.birthdate,
      street: user.street ?? undefined,
      state: user.state ?? undefined,
      postalCode: user.postalCode ?? undefined,
      city: user.city ?? undefined,
      houseNumber: user.houseNumber ?? undefined,
      countryCode:user.countryCode ?? undefined
    },
  });

  const { errors, isDirty } = formState;

  console.log(errors)

  const { mutate, isPending } = useMutation({
    mutationKey: ["update Account"],
    mutationFn: (user: UpdateUserSchema) => updateUser(user, accessToken!),
    onSuccess: () => {
      toast.success("Updated Account successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function submitHandler(user: UpdateUserSchema) {
      mutate(user)
  }

  return (
    <Card className="sm:max-w-[425px] mx-auto p-6 bg-backgroundBright text-white">
      <form onSubmit={handleSubmit(submitHandler)}>
        <CardHeader className="p-0">
          <CardTitle>Update Account Settings</CardTitle>
          <CardDescription>Change your User Settings</CardDescription>
        </CardHeader>
        <FieldGroup className="grid gap-4 mt-2">
          <Field className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" {...register("name")} />
            <InputValidationFailedText
              trigger={errors.name}
              text={errors.name?.message}
            />
          </Field>
          <Field className="grid gap-3">
            <Label htmlFor="birthdate">Birthdate</Label>
            <Input id="birthdate" type="date" {...register("birthdate")} />
            <InputValidationFailedText
              trigger={errors.birthdate}
              text={errors.birthdate?.message}
            />
          </Field>

          <div className="flex justify-between items-center">
            <Field className="grid gap-3 mr-4">
              <Label htmlFor="street">Street</Label>
              <Input id="street" type="text" {...register("street")} />
              <InputValidationFailedText
                trigger={errors.street}
                text={errors.street?.message}
              />
            </Field>
            <Field className="grid gap-3 w-1/3">
              <Label
                htmlFor="houseNumber"
                className="whitespace-nowrap text-ellipsis"
              >
                House Number
              </Label>
              <Input
                id="houseNumber"
                type="text"
                {...register("houseNumber")}
              />
              <InputValidationFailedText
                trigger={errors.houseNumber}
                text={errors.houseNumber?.message}
              />
            </Field>
          </div>

          <div className="flex justify-between items-center">
            <Field className="grid gap-3">
              <Label htmlFor="cc">Country Code</Label>
              <Input id="cc" type="text" {...register("countryCode")} />
              <InputValidationFailedText
                trigger={errors.countryCode}
                text={errors.countryCode?.message}
              />
            </Field>
            <Field className="grid gap-3 mr-4 ml-4">
              <Label htmlFor="state">State</Label>
              <Input id="state" type="text" {...register("state")} />
              <InputValidationFailedText
                trigger={errors.state}
                text={errors.state?.message}
              />
            </Field>
            <Field className="grid gap-3">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" type="text" {...register("postalCode")} />
              <InputValidationFailedText
                trigger={errors.postalCode}
                text={errors.postalCode?.message}
              />
            </Field>
          </div>

          <Field className="grid gap-3">
            <Label htmlFor="city">City</Label>
            <Input id="city" type="text" {...register("city")} />
            <InputValidationFailedText
              trigger={errors.city}
              text={errors.city?.message}
            />
          </Field>
        </FieldGroup>
        <div className="w-full flex flex-col justify-center items-center mt-4">
          <SubmitButton
            text="Submit"
            disabled={isPending || !isDirty}
            isPending={isPending}
          />
          <DeleteAccountButton />
        </div>
      </form>
    </Card>
  );
}
