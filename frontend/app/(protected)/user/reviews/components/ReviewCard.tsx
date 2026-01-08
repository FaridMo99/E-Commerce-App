import { Card } from "@/components/ui/card";
import { AuthProductReview } from "@/types/types";
import ReviewCardInfo from "./ReviewCardInfo";
import ReviewCardContent from "./ReviewCardContent";

export type ReviewCardProps = {
  review: AuthProductReview;
}


function ReviewCard({ review }: ReviewCardProps) {
  const formattedDate = new Date(review.created_at).toLocaleDateString("en-US");

  const cardBg = review.is_public ? "bg-white" : "bg-gray-100";

  return (
    <Card className={`w-full p-5 mb-4 transition-colors ${cardBg} flex flex-col`}>
      <div className="flex justify-between h-full">
        <ReviewCardContent review={review} />
        <ReviewCardInfo review={review} />
      </div>
      <p className="text-sm text-gray-600">Date: {formattedDate}</p>
    </Card>
  );
}

export default ReviewCard;