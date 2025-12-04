"use client";
import ProductCard from "../main/product/ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useQuery } from "@tanstack/react-query";
import useAuth from "@/stores/authStore";
import SectionWrapper from "../main/SectionWrapper";
import BaseSlider from "./BaseSlider";
import { getRecentlyViewedProducts } from "@/lib/queries/client/usersQueries";

function RecentlyViewedProducts() {
  const accessToken = useAuth((state) => state.accessToken);

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["Recently Viewed"],
    queryFn: () => getRecentlyViewedProducts(accessToken!),
    enabled: !!accessToken,
  });


  if (!products || products.length === 0 || isError || isLoading) return null;

  return (
    <SectionWrapper styles="m-8" header="Recently Viewed">
      <BaseSlider>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </BaseSlider>
    </SectionWrapper>
  );
}

export default RecentlyViewedProducts;
