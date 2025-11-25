"use client";
import ProductCard from "../main/ProductCard";
import Slider, { type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Product } from "@/types/types";

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
    <section className="m-8">
      <h2 className="text-3xl font-extrabold mb-2">{title}</h2>
      <Slider {...settings}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Slider>
    </section>
  );
}

export default ProductsCarousel;
