import RatingPreview from "@/components/main/product/Rating";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductReview } from "@/types/types";

type ReviewProps = {
  review: ProductReview;
};

function Review({ review }: ReviewProps) {
  const formattedDate =  new Date(review.created_at).toLocaleDateString('en-US')


  return (
    <Card className="max-w-md mx-auto my-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-col items-start gap-1">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {review.title}
        </CardTitle>
        <span className="text-sm text-gray-500">by {review.user.name}</span>
      </CardHeader>

      <CardContent className="mt-2">
        <RatingPreview rating={review.rating} />
        <p className="mt-2 text-gray-700">{review.content}</p>
      </CardContent>

      <CardFooter className="text-sm text-gray-400 justify-end">
        {formattedDate}
      </CardFooter>
    </Card>
  );
}

export default Review;
