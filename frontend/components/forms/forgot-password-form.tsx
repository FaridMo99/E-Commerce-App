import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Field, FieldGroup, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-backgroundBright text-white ">
        <CardHeader>
          <CardTitle>Request new Email</CardTitle>
          <CardDescription>
            Enter your email to receive a email to change your Password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email:</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmEmail">Confirm Email:</FieldLabel>
                <Input id="confirmEmail" type="confirmEmail" required/>
              </Field>
                <Button type="submit">Submit</Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordForm