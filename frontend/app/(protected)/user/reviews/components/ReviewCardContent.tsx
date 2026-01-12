import Link from "next/link";
import { ReviewCardProps } from "./ReviewCard";

function ReviewCardContent({ review }: ReviewCardProps) {
  return (
    <div>
      <h3 className="font-bold text-xl truncate">{review.title}</h3>
      <Link
        href={`/products/${review.product_id}`}
        className="text-blue-600 hover:underline font-lg"
      >
        {review.product.name}
      </Link>
      <p className="text-gray-700 mb-3 line-clamp-3 truncate text-ellipsis">
        {review.content}
      </p>
    </div>
  );
}

export default ReviewCardContent;
