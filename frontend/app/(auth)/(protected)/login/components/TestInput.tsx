import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STRIPE_ENV } from "@/config/constants";
import { LoginSchema } from "@monorepo/shared";
import { MouseEvent } from "react";
import { type UseFormSetValue } from "react-hook-form";

function TestInput({ setValue }: { setValue: UseFormSetValue<LoginSchema> }) {
    const testMail = "Test@gmail.com"
    const testPassword = "Test123"

    function clickHandler(_e: MouseEvent<HTMLButtonElement>) {
        setValue("email", testMail)
        setValue("password", testPassword)
    }

  if (STRIPE_ENV !== "testing") return null;

  return (
    <Card className="bg-backgroundBright text-white mt-4">
        <CardContent>Testing Email-Address: {testMail}</CardContent>
          <CardContent className="flex justify-between items-center">Testing Password: {testPassword}
              <Button onClick={clickHandler}>Fill Form</Button>
          </CardContent>
    </Card>
  );
}

export default TestInput