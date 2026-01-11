import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

type SubmitButtonProps = {
  isPending: boolean;
  text: string;
  disabled: boolean;
  styles?: string;
}

function SubmitButton({isPending, text, disabled, styles = ""}:SubmitButtonProps) {
  return (
    <Button data-testid="submitButton" className={styles} disabled={disabled} type="submit">
      {isPending ? <Loader2 className="animate-spin text-white" /> : text}
    </Button>
  );
}

export default SubmitButton