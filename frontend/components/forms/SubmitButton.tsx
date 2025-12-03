import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

function SubmitButton({isPending, text, disabled}:{isPending:boolean, text:string, disabled:boolean}) {
  return (
    <Button disabled={disabled} type="submit">
      {isPending ? <Loader2 className="animate-spin" /> : text}
    </Button>
  );
}

export default SubmitButton