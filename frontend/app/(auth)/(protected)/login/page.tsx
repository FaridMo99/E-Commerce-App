import { LoginForm } from "@/components/forms/login-form";

async function page(props: PageProps<"/login">) {
  const { error } = await props.searchParams
  
  return <LoginForm error={!!error} />;
}

export default page;
