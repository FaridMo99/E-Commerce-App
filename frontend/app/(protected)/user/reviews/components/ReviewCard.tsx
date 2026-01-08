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
    <Card className={`w-full p-5 mb-4 transition-colors ${cardBg} flex flex-col`}>

      <div className="flex justify-between h-full">
        
          <div>
            <h3 className="font-bold text-xl truncate">{review.title}</h3>
            <Link
              href={`/products/${review.product_id}`}
              className="text-blue-600 hover:underline font-lg"
            >
              {review.product.name}
            </Link>
            <p className="text-gray-700 mb-3 line-clamp-3 truncate text-ellipsis">{review.content}</p>
        </div>
        
          <div className="flex flex-col items-center justify-between h-full">
            <RatingPreview rating={review.rating} />
            <div className="flex flex-col items-center gap-2 mt-3">
              <DeleteButton reviewId={review.id} />
              <TogglePublicButton
                reviewId={review.id}
                oldState={review.is_public}
              />
            </div>
        </div>
        
      </div>
      
      <p className="text-sm text-gray-600">Date: {formattedDate}</p>
    </Card>
  );
}

export default ReviewCard;