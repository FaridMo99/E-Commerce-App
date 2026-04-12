import { notFound } from "next/navigation";
import "server-only";
import Screen from "./Screen";

async function page(props: PageProps<"/user/orders/success">) {
  const searchParams = await props.searchParams;
  const sessionId = searchParams.session_id;

  if (!sessionId || typeof sessionId !== "string") {
    return notFound();
  }

  return (
    <main className="w-full h-full flex justify-center items-center">
      <Screen sessionId={sessionId} />
    </main>
  );
}

export default page;
