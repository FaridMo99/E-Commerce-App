import { verifyAfterEmailLink } from "@/lib/queries/server/authQueries";
import "server-only";
import SuccessCard from "../../../../components/main/SuccessCard";

async function page(props: PageProps<"/verify-success">) {
  const { token } = await props.searchParams;
  if (!token || typeof token !== "string") throw new Error();

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
