import { notFound } from "next/navigation";
import "server-only"
import Screen from "./Screen";

async function page({ searchParams }: { searchParams: { session_id?: string } }) {
  const params = await searchParams
  const sessionId = params.session_id
  if (!sessionId) return notFound();
  
  
  
  return <Screen sessionId={sessionId} />;
}

export default page