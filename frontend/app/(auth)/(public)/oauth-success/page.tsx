import "server-only";
import SuccessCard from "@/app/(auth)/(protected)/verify-success/components/SuccessCard";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries/server/usersQueries";
import { User } from "@/types/types";

async function page(props:PageProps<"/oauth-success">) {
  const {token} = await props.searchParams
  if (!token) redirect("/");

  let user: User;

  try {
    user = await getUser(token as string);
  } catch (err) {
    console.log(err)
    redirect("/login?error=oAuth");
  }

  return (
    <SuccessCard action="Login" user={user} accessToken={token as string} />
  );
}

export default page;
