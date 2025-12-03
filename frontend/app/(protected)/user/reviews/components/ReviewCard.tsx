import { Card } from "@/components/ui/card";
import { AuthProductReview } from "@/types/types";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import TogglePublicButton from "./TogglePublicButton";
import RatingPreview from "@/components/main/product/Rating";

interface ReviewCardProps {
  review: AuthProductReview;
}


function ReviewCard({ review }: ReviewCardProps) {
  const formattedDate = new Date(review.created_at).toLocaleDateString("en-US");

  const cardBg = review.is_public ? "bg-white" : "bg-gray-100";

  return (
    <Card className={`w-full p-5 mb-4 transition-colors ${cardBg}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <h3 className="font-semibold text-lg truncate">{review.title}</h3>
          <RatingPreview rating={review.rating} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <Link
            href={`/products/${review.product_id}`}
            className="text-blue-600 hover:underline font-medium"
          >
            {review.product.name}
          </Link>

          <div className="flex flex-col sm:flex-row sm:gap-2 mt-2 sm:mt-0">
            <DeleteButton reviewId={review.id} />
            <TogglePublicButton
              reviewId={review.id}
              oldState={review.is_public}
            />
          </div>
        </div>
      </div>
      <p className="text-gray-700 mb-3 line-clamp-3">{review.content}</p>

      <div className="flex justify-between text-sm text-gray-600">
        <p>Date: {formattedDate}</p>
      </div>
    </Card>
  );
}

export default ReviewCard;