import type { FieldError } from "react-hook-form";

type InputValidationProps = {
  trigger?: FieldError;
  text?: string
};

function InputValidationFailedText({trigger, text}:InputValidationProps) {
  return <>{trigger && <p className='text-red-500 text-center'>{text}</p>}</>;
}

export default InputValidationFailedText