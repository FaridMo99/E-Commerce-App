"use client";
import ProductCard from "../main/product/ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useQuery } from "@tanstack/react-query";
import useAuth from "@/stores/authStore";
import SectionWrapper from "../main/SectionWrapper";
import { Product } from "@/types/types";
import BaseSlider from "./BaseSlider";

type ClientCarouselProps = {
    title: string;
    mutationKey: string;
    mutation: (accessToken: string) => Promise<Product[]>
};

function ClientCarousel({title, mutation, mutationKey}:ClientCarouselProps) {
  const accessToken = useAuth((state) => state.accessToken);

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [mutationKey],
    queryFn: () =>mutation(accessToken!),
    enabled: !!accessToken,
  });


  if (!products || products.length === 0 || isError || isLoading) return null;

  return (
    <SectionWrapper styles="m-8" header={title}>
      <BaseSlider>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </BaseSlider>
    </SectionWrapper>
  );
}

export default ClientCarousel;
