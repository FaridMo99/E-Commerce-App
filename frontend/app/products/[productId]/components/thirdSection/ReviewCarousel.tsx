"use client";
import Slider, { type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ProductReview } from "@/types/types";
import Review from "./Review";

type ReviewsCarouselProps = {
  reviews:ProductReview[];
};

function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
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
    <Slider {...settings}>
      {reviews.map((review) => (
        <Review key={review.id} review={review} />
      ))}
    </Slider>
  );
}

export default ReviewsCarousel;
