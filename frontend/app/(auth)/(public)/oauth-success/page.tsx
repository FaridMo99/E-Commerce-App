import "server-only";
import SuccessCard from "@/app/(auth)/(protected)/verify-success/components/SuccessCard";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries/server/usersQueries";
import { toast } from "sonner";
import { User } from "@/types/types";

//access token in searchparam, but not user info
//have to grab that seperately, auto redirect to home after that
async function page({ searchParams }: { searchParams?: { token: string } }) {
  const param = await searchParams;
  if (!param?.token) redirect("/");

  const token = param.token;
  let user: User;

  try {
    user = await getUser(token);
  } catch (err) {
    toast.error("Something went wrong. Try again.");
    redirect("/login");
  }

  return <SuccessCard action="Login" user={user} accessToken={token} />;
}

export default page;
