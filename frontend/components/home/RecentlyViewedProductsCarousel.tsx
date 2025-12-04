"use client";
import ProductCard from "../main/product/ProductCard";
import Slider, { type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getRecentlyViewedProducts } from "@/lib/queries/client/usersQueries";
import { useQuery } from "@tanstack/react-query";
import useAuth from "@/stores/authStore";
import SectionWrapper from "../main/SectionWrapper";


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

  const settings: Settings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    swipe: true,
    swipeToSlide: true,
    arrows: true,
    infinite: true,

    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 820, settings: { slidesToShow: 3 } },
      { breakpoint: 640, settings: { slidesToShow: 2 } },
    ],
  };

  if (!products || products.length === 0 || isError || isLoading) return null;

  return (
    <SectionWrapper header="Recently Viewed">
      <Slider {...settings}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Slider>
    </SectionWrapper>
  );
}

export default RecentlyViewedProductsCarousel;
