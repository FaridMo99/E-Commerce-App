"use client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ProductReview } from "@/types/types";
import Review from "./Review";
import BaseSlider from "@/components/main/BaseSlider";

type ReviewsCarouselProps = {
  reviews:ProductReview[];
};

function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {

  return (
    <BaseSlider>
      {reviews.map((review) => (
        <Review key={review.id} review={review} />
      ))}
    </BaseSlider>
  );
}

export default ReviewsCarousel;
