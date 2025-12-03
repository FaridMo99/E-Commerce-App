"use client"
import { emailSchema } from "@monorepo/shared";
import { sendNewVerificationLink } from "@/lib/queries/client/authQueries";
import CaptchaForm, { InputField } from "./CaptchaForm";

const fields:InputField<typeof emailSchema>[] = [
  {
    label: "Email:",
    name: "email",
    type: "email",
    placeholder: "m@example.com",
  },
];


function NewVerifyLinkForm({ headerText }: { headerText: string }) {

  return (
      <CaptchaForm
        schema={emailSchema}
        headerText={headerText}
        mutationKey={["send new verification link"]}
        mutation={sendNewVerificationLink}
        successMessage="Submit successful! Check your E-Mails and follow the link."
        successRedirect="/"
        description="Enter your email to receive a new Link"
        fields={fields}
      />
  );
}

export default NewVerifyLinkForm;
