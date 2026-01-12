import { Field } from "../ui/field";
import OAuthButton from "./OAuthButton";
import Google from "../icons/Google";

type OAuthButtonSectionProps = {
  isSubmitting: boolean;
  isPending: boolean;
};

function OAuthButtonSection({
  isSubmitting,
  isPending,
}: OAuthButtonSectionProps) {
  return (
    <Field className="flex justify-center items-center">
      <OAuthButton
        bgColor="#DB4437"
        disabled={isSubmitting || isPending}
        logoSvg={<Google />}
        text="Sign up with Google"
        provider="google"
      />
    </Field>
  );
}

export default OAuthButtonSection;
