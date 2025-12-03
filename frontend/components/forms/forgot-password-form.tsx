"use client";

import { Field, FieldDescription } from "../ui/field";
import Link from "next/link";
import { emailSchema } from "@monorepo/shared";
import { forgotPasswordSendEmail } from "@/lib/queries/client/authQueries";
import CaptchaForm, { InputField } from "./CaptchaForm";

const fields: InputField<typeof emailSchema>[] = [
  {
    label: "Email:",
    name: "email",
    type: "email",
    placeholder: "m@example.com",
  },
];

function ForgotPasswordForm({ headerText }: { headerText: string }) {
  return (
    <CaptchaForm
      schema={emailSchema}
      headerText={headerText}
      mutationKey={["send password email for unauthenticated user"]}
      mutation={forgotPasswordSendEmail}
      successMessage="Submit successful! Check your E-Mails and follow the link."
      successRedirect="/"
      description="Enter your email to receive a email to change your Password"
      fields={fields}
    >
      <Field className="mt-4">
        <FieldDescription className="text-center">
          <Link href="/login"> Back to Login</Link>
        </FieldDescription>
      </Field>
    </CaptchaForm>
  );
}

export default ForgotPasswordForm;
