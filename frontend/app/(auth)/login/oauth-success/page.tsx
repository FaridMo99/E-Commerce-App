import "server-only";
import SuccessCard from "../../verify-success/components/SuccessCard";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries/usersQueries";
import { toast } from "sonner";
import useAuth from "@/stores/authStore";

//access token in searchparam, but not user info
//have to grab that seperately, auto redirect to home after that
async function page({ searchParams }: { searchParams?: { token: string } }) {
  const param = await searchParams;
  if (!param?.token) redirect("/");

  const token = param.token;

  try {
    const user = await getUser();
    useAuth.setState({ accessToken: token, user });
  } catch (err) {
    toast.error("Something went wrong. Try again.");
    redirect("/login");
  }

  return <SuccessCard action="Login" />;
}

export default page;
