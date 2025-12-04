import { notFound } from "next/navigation";
import "server-only"
import Screen from "./Screen";

async function page(props:PageProps<"/user/orders/success">) {
  const { session_id } = await props.searchParams;

  if (!session_id) return notFound();
  
  
  
  return <Screen sessionId={session_id as string} />;
}

export default page