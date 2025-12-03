import { notFound } from "next/navigation"
import "server-only"
import Screen from "./Screen"

async function page({ searchParams }: { searchParams?: { cancelOrderId: string } }) {
  
  const params = await searchParams
  const cancelOrderId = params?.cancelOrderId;
  
  if (!cancelOrderId) return notFound()

  return <Screen cancelOrderId={ cancelOrderId } />
}

export default page