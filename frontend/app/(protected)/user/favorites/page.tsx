"use client"
import LoadingPage from "@/components/main/LoadingPage";
import { getUserFavoriteItems } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import ProductGrid from "./components/ProductGrid";

//error page
function Page() {
  const accessToken = useAuth(state => state.accessToken)
  
  const { data: favoriteProducts, isLoading, isError, error } = useQuery({
    queryKey: ["get user favorite products"],
    queryFn:()=>getUserFavoriteItems(accessToken!)
  })

  if (isLoading) return <LoadingPage />
  if (isError) throw error
  
  return (
    <main>
      <h2 className="text-3xl font-extrabold mb-2 pl-8">
        Favorites({favoriteProducts?.length})
      </h2>
      <div className="w-full flex flex-col justify-between items-center">
        <ProductGrid products={favoriteProducts ?? []}/>
      </div>
    </main>
  );
}

export default Page;
