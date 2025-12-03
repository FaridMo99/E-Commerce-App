"use client";
import ProductCard from "../main/product/ProductCard";
import Slider, { type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Product } from "@/types/types";
import SectionWrapper from "../main/SectionWrapper";

type ProductsCarouselProps = {
  title: string;
  products: Product[];
};

function ProductsCarousel({ title, products }: ProductsCarouselProps) {
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
  return (
    <SectionWrapper styles="m-8" header={title}>
      <Slider {...settings}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Slider>
    </SectionWrapper>
  );
}

export default ProductsCarousel;
