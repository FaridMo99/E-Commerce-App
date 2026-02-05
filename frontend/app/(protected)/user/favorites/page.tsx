"use client";
import LoadingPage from "@/components/main/LoadingPage";
import { getUserFavoriteItems } from "@/lib/queries/client/usersQueries";
import useAuth from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import SectionWrapper from "@/components/main/SectionWrapper";
import BaseSlider from "@/components/main/BaseSlider";
import ProductCard from "@/components/main/product/ProductCard";

function Page() {
  const accessToken = useAuth((state) => state.accessToken);

  const {
    data: favoriteProducts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["get user favorite products"],
    queryFn: () => getUserFavoriteItems(accessToken!),
  });

  if (isLoading) return <LoadingPage />;
  if (isError) throw error;

  return (
    <SectionWrapper
      styles="px-8"
      as="main"
      header={`Favorites(${favoriteProducts?.length})`}
    >
      {favoriteProducts && favoriteProducts.length > 0 && <BaseSlider>
        {favoriteProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </BaseSlider>}
    </SectionWrapper>
  );
}

export default Page;
