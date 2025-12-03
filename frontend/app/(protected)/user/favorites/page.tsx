"use client"
import LoadingPage from "@/components/main/LoadingPage";
import { getUserFavoriteItems } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import ProductGrid from "./components/ProductGrid";
import SectionWrapper from "@/components/main/SectionWrapper";

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
    <SectionWrapper styles="" as="main" header={`Favorites(${favoriteProducts?.length})`}>
      <div className="w-full flex flex-col justify-between items-center">
        <ProductGrid products={favoriteProducts ?? []}/>
      </div>
    </SectionWrapper>
  );
}

export default Page;
