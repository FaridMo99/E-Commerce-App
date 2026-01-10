import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

export type InputValidationProps = {
  trigger?:
    | FieldError
    | boolean
    | string
    | Merge<FieldError, FieldErrorsImpl>
    | Merge<FieldError, (FieldError | undefined)[]>;
  text?: string | FieldError | Merge<FieldError, FieldErrorsImpl> ;
};

function InputValidationFailedText({ trigger, text }: InputValidationProps) {
  return <>{trigger && <p className="text-red-500 text-center">{String(text)}</p>}</>;
}

export default InputValidationFailedText;
