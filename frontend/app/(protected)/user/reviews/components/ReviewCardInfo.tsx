import { ReviewCardProps } from './ReviewCard'
import RatingPreview from '@/components/main/product/Rating';
import DeleteButton from './DeleteButton';
import TogglePublicButton from './TogglePublicButton';

function ReviewCardInfo({review}:ReviewCardProps) {
  return (
    <div className="flex flex-col items-center justify-between h-full">
      <RatingPreview rating={review.rating} />
      <div className="flex flex-col items-center gap-2 mt-3">
        <DeleteButton reviewId={review.id} />
        <TogglePublicButton reviewId={review.id} oldState={review.is_public} />
      </div>
    </div>
  );
}

export default ReviewCardInfo