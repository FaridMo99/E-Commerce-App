"use client";
import Slider, { type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Product } from "@/types/types";

type ImageCarouselProps = {
    imageUrls:Product["imageUrls"]
};


function ImageCarousel({ imageUrls }: ImageCarouselProps) {
  const settings: Settings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    swipe: true,
    swipeToSlide: true,
    arrows: true,
    infinite: true,

    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 640, settings: { slidesToShow: 3 } },
    ],
  };
  return (
      <Slider {...settings}>
        {imageUrls.map((url) => (
            <img key={url} src={url} alt="Product Image" />
        ))}
      </Slider>
  );
}

export default ImageCarousel;
