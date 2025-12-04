import { verifyAfterEmailLink } from "@/lib/queries/server/authQueries";
import "server-only";
import SuccessCard from "./components/SuccessCard";

async function page(props:PageProps<"/verify-success">) {
  const {token}  = await props.searchParams;
  if (!token) throw new Error();

  const res = await verifyAfterEmailLink(token as string);

  return (
    <SuccessCard
      action="Signup"
      accessToken={res.accessToken}
      user={res.user}
    />
  );
}

export default page;
