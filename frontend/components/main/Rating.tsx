import { Rating, RatingButton } from '../ui/shadcn-io/rating'

type RatingPreviewProps = {
    rating: number,
  reviewsAmount?: number
}

function RatingPreview({ rating, reviewsAmount }: RatingPreviewProps) {
  return (
    <div className="flex flex-col justify-center items-center">
      <Rating value={rating} readOnly>
        {Array.from({ length: 5 }).map((_, index) => (
          <RatingButton className="text-yellow-500" key={index} />
        ))}
      </Rating>
      {reviewsAmount && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Reviews:{reviewsAmount}
          </p>
        </div>
      )}
    </div>
  );
}

export default RatingPreview