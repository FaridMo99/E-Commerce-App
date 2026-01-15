import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { STRIPE_ENV } from "@/config/constants";

async function page(props: PageProps<"/login">) {
  const { error } = await props.searchParams;

  return (
    <main>
      <LoginForm error={!!error} />
      {STRIPE_ENV === "testing" && (
        <Card className="bg-backgroundBright text-white mt-4">
          <CardContent>Testing Email-Address: Test@gmail.com</CardContent>
          <CardContent>Testing Password: Test123</CardContent>
        </Card>
      )}
    </main>
  );
}

export default page;
