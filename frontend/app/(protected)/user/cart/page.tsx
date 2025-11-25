"use client"
import LoadingPage from "@/components/main/LoadingPage";
import { getUserCart } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import StripeCheckoutButton from "./components/StripeCheckoutButton";
import Item from "./components/Item";
import EmptyCartButton from "./components/EmptyCartButton";

//error page
//this the route you get to when clicking on cart
//this the last route before stripe checkout
//make order summary better
function Page() {
  const accessToken = useAuth(state => state.accessToken)
  
  const { data: cart, isLoading, isError, error } = useQuery({
    queryKey: ["get user shopping cart"],
    queryFn:()=>getUserCart(accessToken!)
  })

  if (isLoading) return <LoadingPage />
  if (isError) throw error
  
  return (
    <main className="w-full h-full flex justify-center items-center">
      <div className="w-[80vw] h-[67vh] bg-backgroundBright flex border rounded-2xl overflow-clip relative">
      { cart && cart.items.length > 0 && <EmptyCartButton /> }
        {/* item section */}
        <section className="w-2/3 h-full overflow-scroll flex flex-col">
          {cart?.items.map((item) => (
            <Item key={item.id} item={item} />
          ))}
        </section>
        {/* summary section */}
        <section className="w-1/3 h-full overflow-scroll border-l flex flex-col items-center justify-evenly">
          <div className="w-full h-2/3 flex flex-col justify-evenly items-center">
            <p>Total Items: {cart?._count.items}</p>
            <p>Total Price:{ cart?.id}</p>
          </div>
          <StripeCheckoutButton />
        </section>
      </div>
    </main>
  );
}

export default Page;
