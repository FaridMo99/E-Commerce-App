"use client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getRecentlyViewedProducts } from "@/lib/queries/client/usersQueries";
import { useQuery } from "@tanstack/react-query";
import useAuth from "@/stores/authStore";
import ProductCard from "@/components/main/product/ProductCard";
import SectionWrapper from "@/components/main/SectionWrapper";
import BaseSlider from "@/components/main/BaseSlider";

function RecentlyViewedProductsCarousel() {
  const accessToken = useAuth((state) => state.accessToken);

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["get recently viewed products", accessToken],
    queryFn: () => {
      if (accessToken) return getRecentlyViewedProducts(accessToken);
    },
    enabled: !!accessToken,
  });

  if (!products || products.length === 0 || isError || isLoading) return null;

  return (
    <SectionWrapper styles="" header="Recently Viewed">
      <BaseSlider>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </BaseSlider>
    </SectionWrapper>
  );
}

export default RecentlyViewedProductsCarousel;
