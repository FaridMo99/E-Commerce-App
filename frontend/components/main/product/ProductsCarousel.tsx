"use client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Product } from "@/types/types";
import SectionWrapper from "../SectionWrapper";
import BaseSlider from "../BaseSlider";
import ProductCard from "./ProductCard";

type ProductsCarouselProps = {
  title: string;
  products: Product[];
};

function ProductsCarousel({ title, products }: ProductsCarouselProps) {
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

export default ProductsCarousel;
