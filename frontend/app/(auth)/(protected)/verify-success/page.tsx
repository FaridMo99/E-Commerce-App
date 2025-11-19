import { verifyAfterEmailLink } from "@/lib/queries/server/authQueries";
import "server-only";
import SuccessCard from "./components/SuccessCard";

async function page({ searchParams }: { searchParams?: { token: string } }) {
  const param = await searchParams;
  if (!param?.token) throw new Error();

  const token = param.token;

  const res = await verifyAfterEmailLink(token);

  return (
    <SuccessCard
      action="Signup"
      accessToken={res.accessToken}
      user={res.user}
    />
  );
}

export default page;
